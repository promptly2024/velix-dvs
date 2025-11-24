import cloudinary from "../config/cloudinary";
import path from "path";

export const uploadToCloudinary = (
    fileBuffer: Buffer,
    fileName: string,
    folder: string = "uploads",
    maxSizeInBytes: number = 10 * 1024 * 1024 // 10 MB
): Promise<{
    secureUrl: string;
    publicId: string;
    resourceType: string;
    size?: number;
}> => {
    // resource type should only be image and pdf.
    const allowedResourceTypes = ["image", "pdf"];

    return new Promise((resolve, reject) => {
        // Input validation
        if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
            return reject(new Error("Invalid file buffer"));
        }
        if (!fileName || typeof fileName !== "string") {
            return reject(new Error("Invalid file name"));
        }
        if (fileBuffer.length > maxSizeInBytes) {
            return reject(new Error(`File too large. Max allowed is ${maxSizeInBytes} bytes`));
        }

        // Determine extension and map to Cloudinary resource_type
        const ext = path.extname(fileName).toLowerCase();
        let resourceTypeOption = "auto"; // default
        let detectedType = "image";

        if (ext === ".pdf") {
            detectedType = "pdf";
            resourceTypeOption = "raw";
        } else {
            // basic image extensions
            const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"];
            if (imageExts.includes(ext)) {
                detectedType = "image";
                resourceTypeOption = "image";
            } else {
                // fallback to auto but still validate allowed types
                resourceTypeOption = "auto";
                detectedType = "unknown";
            }
        }

        if (!allowedResourceTypes.includes(detectedType) && detectedType !== "unknown") {
            return reject(new Error(`Unsupported file type: ${ext}`));
        }

        // Sanitize filename for public_id
        const safeName = fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
        const publicId = `${Date.now()}_${safeName}`;

        const uploadOptions: Record<string, any> = {
            folder,
            public_id: publicId,
            resource_type: resourceTypeOption,
        };

        // Timeout handling
        const UPLOAD_TIMEOUT_MS = 30_000; // 30s
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            const err = new Error("Cloudinary upload timed out");
            // reject if still pending
            reject(err);
        }, UPLOAD_TIMEOUT_MS);

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                clearTimeout(timeoutId);
                if (timedOut) return;
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error("Cloudinary upload failed: no result"));
                }

                resolve({
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    resourceType: result.resource_type,
                    size: result.bytes,
                });
            }
        );

        // stream-level error guard
        uploadStream.on("error", (err: Error) => {
            clearTimeout(timeoutId);
            if (timedOut) return;
            console.error("Upload stream error:", err);
            reject(err);
        });

        uploadStream.end(fileBuffer);
    });
};

export const uploadMediaToCloudinary = (
    fileBuffer: Buffer,
    fileName: string,
    folder: string = "scenes",
    maxSizeInBytes: number = 100 * 1024 * 1024
): Promise<{
    secureUrl: string;
    publicId: string;
    resourceType: string;
}> => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
            return reject(new Error("Invalid file buffer"));
        }

        const ext = path.extname(fileName).toLowerCase();
        const videoExts = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".mkv", ".webm"];
        const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

        let resourceType: "image" | "video" = "image";
        if (videoExts.includes(ext)) {
            resourceType = "video";
        } else if (!imageExts.includes(ext)) {
            return reject(new Error(`Unsupported file type: ${ext}`));
        }

        const safeName = fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "").replace(ext, "");
        const publicId = `${Date.now()}_${safeName}`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary upload failed"));
                }

                resolve({
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    resourceType: result.resource_type,
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};