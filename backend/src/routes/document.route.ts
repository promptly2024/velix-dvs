import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/requireAuth";
import { uploadDocumentHandler } from "../controllers/doccontroller";
import multer from "multer";

// Base URl : http://localhost:3001/api/v1/document
export const documentRouter = Router();


const upload = multer({ storage: multer.memoryStorage() });
// Auth Routes
documentRouter.post('/upload', requireAuth, upload.single('document'), asyncHandler(uploadDocumentHandler));