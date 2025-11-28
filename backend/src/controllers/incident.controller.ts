import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Start Incident Flow Controller
export const startIncident = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const userId = req.user?.userId;

        // A. Check if workflow exists for this category
        const workflow = await prisma.incidentWorkflow.findUnique({
            where: { category: category as any },
        });

        if (!workflow || !workflow.startNodeId) {
            console.log("Workflow not found for category:", category);
            return res.status(404).json({ error: "Workflow not found for this threat." });
        }

        // Check if user already has an open incident of this category and incomplete within last 24 hours
        const existingIncident = await prisma.incidentReport.findFirst({
            where: {
                userId: userId,
                category: category as any,
                status: 'OPEN',
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // within last 24 hours
            }
        });

        let shouldCreateNewIncident = true;

        if (existingIncident && existingIncident.currentNodeId) {
            const currentNode = await prisma.workflowNode.findUnique({
                where: { id: existingIncident.currentNodeId },
                include: {
                    options: true,
                    template: true
                }
            });

            if (currentNode === null) {
                console.log("Current node not found for incident:", existingIncident.id);
                return res.status(500).json({ error: "Corrupted incident data. Please start a new incident." });
            }
            console.log("\n\nFound existing incident:", currentNode);

            // Check if incident is completed (no options OR all options lead to null)
            const isCompleted = currentNode.options.length === 0 ||
                currentNode.options.every(opt => opt.nextNodeId === null);

            if (isCompleted) {
                // Incident already completed - close it and start a new one
                await prisma.incidentReport.update({
                    where: { id: existingIncident.id },
                    data: { status: 'RESOLVED' }
                });
                console.log("Closed completed incident:", existingIncident.id);
                shouldCreateNewIncident = true;
            } else {
                // resume existing incident
                shouldCreateNewIncident = false;
                console.log("Resuming existing incident:", existingIncident.id);
                return res.status(200).json({
                    message: "Resuming existing incident.",
                    incidentId: existingIncident.id,
                    node: currentNode,
                    restoredInput: existingIncident.inputs
                });
            }
        }

        // if no existing incident or previous one was completed, create a new one
        if (shouldCreateNewIncident) {
            console.log("Creating new incident for user:", userId);
            // B. Fetch the First Question (Start Node) & its Options
            const firstNode = await prisma.workflowNode.findUnique({
                where: { id: workflow.startNodeId },
                include: {
                    options: {
                        orderBy: { order: 'asc' } // Sort buttons if needed
                    }
                }
            });

            // C. Create a Tracker (IncidentReport) for User History
            // Isse hum track karenge ki user ne kab start kiya aur kahan tak pahuncha
            const incident = await prisma.incidentReport.create({
                data: {
                    userId: userId || "guest_user", // Handle unauth users if needed
                    category: category as any,
                    currentNodeId: workflow.startNodeId,
                    status: 'OPEN'
                }
            });

            return res.status(200).json({
                incidentId: incident.id,
                node: firstNode
            });
        }
    } catch (error) {
        console.error("Start Incident Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// ==========================================
// 2. NEXT STEP (User clicks an option)
// ==========================================
export const nextStep = async (req: Request, res: Response) => {
    try {
        const { incidentId, selectedOptionId } = req.body;

        // A. Validate Option
        const option = await prisma.workflowOption.findUnique({
            where: { id: selectedOptionId }
        });

        if (!option) {
            return res.status(400).json({ error: "Invalid option selected." });
        }

        // B. Update User's Progress in DB
        await prisma.incidentReport.update({
            where: { id: incidentId },
            data: {
                currentNodeId: option.nextNodeId || null,
                // Future: If user entered text (like bank name), save it here in 'inputs' field
                status: option.nextNodeId ? 'OPEN' : 'RESOLVED' // If no next node, close it
            }
        });

        // C. Check if Flow is Finished
        if (!option.nextNodeId) {
            return res.json({
                finished: true,
                message: "You have completed all recommended steps. Stay Safe!"
            });
        }

        // D. Fetch Next Node Data
        const nextNode = await prisma.workflowNode.findUnique({
            where: { id: option.nextNodeId },
            include: {
                options: true,
                template: true // Fetch template details if it's a form step
            }
        });

        return res.json({
            finished: false,
            node: nextNode
        });

    } catch (error) {
        console.error("Next Step Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// ==========================================
// 3. GENERATE TEMPLATE (for TEMPLATE_FORM node)
// ==========================================
export const generateTemplateForCurrentNode = async (req: Request, res: Response) => {
    try {
        const { incidentId, inputData } = req.body as { incidentId?: string; inputData?: Record<string, string> };
        if (!incidentId) return res.status(400).json({ error: 'incidentId is required' });

        // Fetch incident and current node with template
        const incident = await prisma.incidentReport.findUnique({ where: { id: incidentId } });
        if (!incident) return res.status(404).json({ error: 'Incident not found' });
        if (!incident.currentNodeId) return res.status(400).json({ error: 'Incident has no active node' });

        const node = await prisma.workflowNode.findUnique({
            where: { id: incident.currentNodeId },
            include: { template: true }
        });

        if (!node) return res.status(404).json({ error: 'Current node not found' });
        if (node.type !== 'TEMPLATE_FORM') return res.status(400).json({ error: 'Current node is not a TEMPLATE_FORM' });
        if (!node.template) return res.status(404).json({ error: 'Template not linked to current node' });

        const templateBody = node.template.body || '';
        const values = (inputData || {}) as Record<string, string>;

        // Simple placeholder replacement: {{Key}}
        const filledText = templateBody.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_match, p1: string) => {
            const key = String(p1);
            return values[key] != null ? String(values[key]) : `{{${key}}}`;
        });

        // Persist provided inputs onto incident for resume
        await prisma.incidentReport.update({
            where: { id: incidentId },
            data: { inputs: { ...(incident.inputs as any), ...(values as any) } }
        });

        return res.json({
            templateName: node.template.name,
            filledText
        });
    } catch (error) {
        console.error('Generate Template Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 3. GET ALL THREATS
export const getAllThreats = async (req: Request, res: Response) => {
    try {
        const threats = await prisma.threatCategory.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                key: true
            }
        });
        return res.status(200).json({ threats });
    } catch (error) {
        console.error("Get All Threats Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};