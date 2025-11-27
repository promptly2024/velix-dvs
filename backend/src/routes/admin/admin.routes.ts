import { Router } from "express";
import { adminLevelRouter } from "./level.routes";
import { adminSceneRouter } from "./scene.routes";
import { adminOptionRouter } from "./option.routes";
import { adminQuestionRoutes } from "./question.routes";
import { getAllWorkflows, addOption, createNode, deleteNode, deleteOption, getWorkflowDetails, setStartNode, updateNode } from "../../controllers/admin.workflow.controller";
import { requireAdminAuth } from "../../middlewares/requireAuth";
export const adminRouter = Router();

// base url: http://localhost:3001/api/v1/admin

adminRouter.use("/levels", adminLevelRouter);
adminRouter.use("/scene", adminSceneRouter);
adminRouter.use("/question", adminQuestionRoutes);
adminRouter.use("/option", adminOptionRouter);

// Workflows
adminRouter.get('/workflows', getAllWorkflows);
adminRouter.get('/workflow/:workflowId/nodes', requireAdminAuth, getWorkflowDetails);
adminRouter.put('/workflow/set-start', requireAdminAuth, setStartNode);

// Nodes (Questions)
adminRouter.post('/node', requireAdminAuth, createNode);
adminRouter.put('/node/:nodeId', requireAdminAuth, updateNode);
adminRouter.delete('/node/:nodeId', requireAdminAuth, deleteNode);

// Options (Connections)
adminRouter.post('/option', requireAdminAuth, addOption);
adminRouter.delete('/option/:optionId', requireAdminAuth, deleteOption);