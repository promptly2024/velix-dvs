import express from 'express';
import { startIncident, nextStep, getAllThreats, generateTemplateForCurrentNode } from '../controllers/incident.controller';
import { requireAuth } from '../middlewares/requireAuth';

const incidentRouter = express.Router();

// Base URL: http://localhost:3001/api/v1/incident

// GET: /start/FINANCIAL_THREAT
incidentRouter.get('/start/:category', requireAuth, startIncident);

// POST: /next
// Body: { "incidentId": "...", "selectedOptionId": "..." }
incidentRouter.post('/next', requireAuth, nextStep);

// POST: /generate-template
// Body: { "incidentId": "...", "inputData": { key: value } }
incidentRouter.post('/generate-template', requireAuth, generateTemplateForCurrentNode);

// get all 13 threats
incidentRouter.get('/threats', requireAuth, getAllThreats);
export default incidentRouter;