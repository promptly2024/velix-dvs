// backendsrc/controllers/doccontroller.ts
import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { performOCR } from "../helper/OCR";

export const uploadDocumentHandler = async (req: Request, res: Response) => {
    console.log("\n\nReceived new request to upload document.");
    try {
        const file = req.file as Express.Multer.File | undefined;

        if (!file) {
            console.error("No file uploaded");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Ensure buffer is present (multer memoryStorage)
        if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
            return res.status(400).json({ success: false, message: "Uploaded file is not available in memory. Ensure multer is configured with memoryStorage." });
        }

        // Attempt upload
        const folder = "documents";
        const fileType: "image_url" | "document_url" = file.mimetype.startsWith("image/") ? "image_url" : "document_url";
        const result = await uploadToCloudinary(file.buffer, file.originalname, folder);
        console.log("\n\nCloudinary upload result:", result);
        console.log("\n\nNow performing OCR...");
        // Upload to Cloudinary successful, NOw OCR happen.
        const ocrResult = await performOCR(fileType, result.secureUrl);
        console.log("\n\nOCR result:", ocrResult);

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully.",
            ocr: ocrResult,
            data: {
                url: result.secureUrl,
                publicId: result.publicId,
                resourceType: result.resourceType,
                size: result.size,
            },
        });
    } catch (error: any) {
        // Map known error messages to HTTP status codes
        const msg = error?.message || "Internal server error";

        if (msg.includes("File too large")) {
            return res.status(413).json({ success: false, message: msg });
        }

        if (msg.includes("Unsupported file type") || msg.includes("Invalid file")) {
            return res.status(400).json({ success: false, message: msg });
        }

        console.error("uploadDocumentHandler error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};