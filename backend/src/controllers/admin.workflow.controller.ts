import { Request, Response } from 'express';
import { WorkflowNodeType } from '@prisma/client';
import { prisma } from '../lib/prisma';



// 1. WORKFLOW MANAGEMENT


// Get All Threats (List for Dropdown)
export const getAllWorkflows = async (req: Request, res: Response) => {
    try {
        const workflows = await prisma.incidentWorkflow.findMany({
            select: { id: true, title: true, category: true, startNodeId: true, nodes: true }
        });
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch workflows" });
    }
};

// Get Full Graph (Nodes + Options) for a specific Threat
export const getWorkflowDetails = async (req: Request, res: Response) => {
    try {
        const { workflowId } = req.params;
        console.log("Fetching workflow details for ID:", workflowId);
        const nodes = await prisma.workflowNode.findMany({
            where: { workflowId },
            include: {
                options: { orderBy: { order: 'asc' } } // Connections bhi chahiye
            },
            orderBy: { title: 'asc' }
        });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch nodes" });
    }
};

// Set the Starting Question (Root Node)
export const setStartNode = async (req: Request, res: Response) => {
    try {
        const { workflowId, nodeId } = req.body;

        await prisma.incidentWorkflow.update({
            where: { id: workflowId },
            data: { startNodeId: nodeId }
        });

        // Mark node as start node flag as well
        await prisma.workflowNode.updateMany({ where: { workflowId }, data: { isStartNode: false } });
        await prisma.workflowNode.update({ where: { id: nodeId }, data: { isStartNode: true } });

        res.json({ message: "Start node updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to set start node" });
    }
};


// 2. NODE MANAGEMENT (Questions/Steps)


// Create a New Node
export const createNode = async (req: Request, res: Response) => {
    try {
        const { workflowId, title, content, type, resourceLink } = req.body;
        // title: internal ID like 'fin_q1', content: 'Money deducted?'

        const newNode = await prisma.workflowNode.create({
            data: {
                workflowId,
                title,
                content,
                type: type as WorkflowNodeType, // QUESTION, ACTION, INFO, etc.
                resourceLink
            }
        });
        res.json(newNode);
    } catch (error) {
        res.status(500).json({ error: "Failed to create node" });
    }
};

// Update Existing Node
export const updateNode = async (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        const { title, content, type, resourceLink } = req.body;

        const updatedNode = await prisma.workflowNode.update({
            where: { id: nodeId },
            data: { title, content, type, resourceLink }
        });
        res.json(updatedNode);
    } catch (error) {
        res.status(500).json({ error: "Failed to update node" });
    }
};

// Delete Node
export const deleteNode = async (req: Request, res: Response) => {
    try {
        const { nodeId } = req.params;
        // Note: Options will be deleted automatically if cascade is on, 
        // otherwise you might need to delete options first.
        await prisma.workflowNode.delete({ where: { id: nodeId } });
        res.json({ message: "Node deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete node" });
    }
};


// 3. OPTION MANAGEMENT (Connecting Nodes)


// Add a Button/Link (Edge)
export const addOption = async (req: Request, res: Response) => {
    try {
        const { currentNodeId, label, nextNodeId, order } = req.body;

        const option = await prisma.workflowOption.create({
            data: {
                nodeId: currentNodeId,
                label,
                nextNodeId, // Can be null if it's an end step
                order: order || 0
            }
        });
        res.json(option);
    } catch (error) {
        res.status(500).json({ error: "Failed to add option" });
    }
};

// Delete a Button/Link
export const deleteOption = async (req: Request, res: Response) => {
    try {
        const { optionId } = req.params;
        await prisma.workflowOption.delete({ where: { id: optionId } });
        res.json({ message: "Option deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete option" });
    }
};