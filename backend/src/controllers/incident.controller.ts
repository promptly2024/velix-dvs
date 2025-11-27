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
            return res.status(404).json({ error: "Workflow not found for this threat." });
        }

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