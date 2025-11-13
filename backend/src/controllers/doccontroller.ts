// backendsrc/controllers/doccontroller.ts
import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { performOCR } from "../helper/OCR";
import { extractPanAadhaar } from "../utils/extractPanAadhaar";

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

        let ocrResult = null;
        try {
            ocrResult = await performOCR(fileType, result.secureUrl);
        } catch (ocrErr: any) {
            console.error("OCR processing error:", ocrErr);
            ocrResult = null;
        }
        const { aadhaar, pan } = extractPanAadhaar(ocrResult?.pages?.map((p: any) => p.markdown).join("\n") || "");
        console.log("Extracted PAN:", pan, "Aadhaar:", aadhaar);
        return res.status(201).json({
            success: true,
            message: ocrResult ? "Document uploaded and processed successfully." : "Document uploaded successfully. OCR processing failed or is unavailable.",
            ocr: ocrResult,
            pan, aadhaar,
            data: {
                url: result.secureUrl,
                publicId: result.publicId,
                resourceType: result.resourceType,
                size: result.size,
            },
        });
    } catch (error: any) {
        const msg = error?.message || "Internal server error";

        console.error("uploadDocumentHandler error:", error);

        if (msg.includes("File too large")) {
            return res.status(413).json({ success: false, message: msg });
        }

        if (msg.includes("Unsupported file type") || msg.includes("Invalid file")) {
            return res.status(400).json({ success: false, message: msg });
        }

        if (msg.includes("timed out") || msg.includes("timed out")) {
            return res.status(504).json({ success: false, message: "Upload timed out. Please try again." });
        }

        if (msg.toLowerCase().includes("cloudinary") || msg.toLowerCase().includes("upload failed") || msg.toLowerCase().includes("upload error")) {
            return res.status(502).json({ success: false, message: "Failed to upload file. Please try again later." });
        }

        return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
    }
};