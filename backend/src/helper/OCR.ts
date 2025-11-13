import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

export async function performOCR(documentType: "image_url" | "document_url", documentUrl: string) {
    // create a properly narrowed document chunk so TypeScript can match the expected union type
    const documentChunk =
        documentType === "document_url"
            ? { type: "document_url" as const, documentUrl }
            : { type: "image_url" as const, imageUrl: documentUrl };

    const ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: documentChunk,
        includeImageBase64: true
    });
    return ocrResponse;
}