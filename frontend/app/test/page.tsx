/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from 'react'
/*
{
    success: true,
        message: "Document uploaded successfully.",
            ocr: ocrResult,
                data: {
        url: result.secureUrl,
            publicId: result.publicId,
                resourceType: result.resourceType,
                    size: result.size,
            },
}
            {
  "pages": [
    {
      "index": 0,
      "markdown": "PLACE FACE UP ON DASH\nCITY OF PALO ALTO\nNOT VALID FOR\nONSTREET PARKING\n\nExpiration Date/Time\n11:59 PM\nAUG 19, 2024\n\nPurchase Date/Time: 01:34pm Aug 19, 2024\nTotal Due: $15.00\nTotal Paid: $15.00\nTicket #: 00005883\nS/N #: 520117260957\nSetting: Permit Machines\nMach Name: Civic Center\n\n#****-1224, Visa\nDISPLAY FACE UP ON DASH\n\nPERMIT EXPIRES\nAT MIDNIGHT",
      "images": [],
      "dimensions": {
        "dpi": 200,
        "height": 3210,
        "width": 1806
      }
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 1,
    "doc_size_bytes": 3110191
  }
}
   */
interface OCRResult {
    pages: Array<{
        index: number;
        markdown: string;
        images: Array<any>;
        dimensions: {
            dpi: number;
            height: number;
            width: number;
        };
    }>;
}
interface ResponseData {
    success: boolean;
    message: string;
    ocr: OCRResult;
    data: {
        url: string;
        publicId: string;
        resourceType: string;
        size: number;
    };
}
const Test = () => {
    const APIURL = "http://localhost:3001/api/v1/document/upload";
    const [response, setResponse] = React.useState<ResponseData | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = React.useState<boolean>(false);

    // helper to handle FileList from input or drop
    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setLoading(true);
        setError(null);
        const file = fileList[0];
        setFileName(file.name);
        const formData = new FormData();
        formData.append('document', file);
        try {
            const res = await fetch(APIURL, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZWJkMmRjZi1jMGFjLTRkMjAtODFjMS04M2RkNzA1NGY3YTYiLCJpYXQiOjE3NjMwMjEzMzcsImV4cCI6MTc2MzYyNjEzN30.Fd2xXbNnmTW5uYc-uWM4JSQLi2_AKUrkw4naqOrCP5g'
                },
                body: formData,
            });
            const data = await res.json();
            setResponse(data);
        }
        catch (err) {
            const errorData = err as Error;
            setError(errorData.message);
            console.error("Error uploading file:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(event.target.files);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const clearAll = () => { setResponse(null); setFileName(null); setError(null); }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Document Upload Test</h1>
                        <p className="text-sm text-gray-500 mt-1">Drop a document or click to choose. OCR preview is shown below.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {loading && <span className="inline-flex items-center gap-2 text-indigo-600 text-sm font-medium"><span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />Uploading</span>}
                        {response?.success && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">Uploaded</span>}
                        {error && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">Error</span>}
                    </div>
                </div>

                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={() => setDragActive(false)}
                    className={`mt-6 border-2 ${dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-dashed border-gray-200 bg-gray-50'} rounded-lg p-6 flex flex-col sm:flex-row items-center gap-4 cursor-pointer transition`}
                >
                    <div className="flex items-center justify-center w-24 h-24 bg-white rounded-md shadow-sm">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Click or drop file to upload</p>
                        <p className="text-xs text-gray-400 mt-1">Supported: any document. Max size: server dependent.</p>
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span>Choose file</span>}
                            </button>

                            <button
                                type="button"
                                onClick={clearAll}
                                className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100"
                            >
                                Clear
                            </button>

                            <span className="text-sm text-gray-500 ml-auto">{fileName ?? 'No file chosen'}</span>
                        </div>
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="*/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-white border rounded-lg p-4 shadow-sm">
                        <h2 className="text-sm font-medium text-gray-800 mb-2">OCR Preview</h2>
                        {response?.ocr?.pages?.length ? (
                            <div className="prose max-w-none text-sm text-gray-700 overflow-auto max-h-64 p-2 bg-gray-50 rounded">
                                {response.ocr.pages.map((p, idx) => (
                                    <div key={idx} className="mb-4">
                                        <div className="text-xs text-gray-500 mb-1">Page {p.index}</div>
                                        <pre className="whitespace-pre-wrap text-sm">{p.markdown}</pre>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400">No OCR data yet.</div>
                        )}
                    </div>

                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-800 mb-2">Details</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">File</span><span>{fileName ?? '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">OCR pages</span><span>{response?.ocr?.pages?.length ?? 0}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Size</span><span>{response?.data?.size ? `${response.data.size} bytes` : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">URL</span>
                                <span className="truncate max-w-[8rem] text-indigo-600">{response?.data?.url ? response.data.url : '-'}</span>
                            </div>
                        </div>
                        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
                    </div>
                </div>

                {/* raw response */}
                {response && (
                    <div className="mt-6">
                        <h2 className="text-sm font-medium text-gray-800 mb-2">Raw Response</h2>
                        <pre className="bg-gray-900 text-white p-4 rounded-md text-xs font-mono overflow-auto max-h-48">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}
                {/* // view uploaded image / pdf if any0 */}
                {response?.data?.url && (
                    <div className="mt-6">
                        <h2 className="text-sm font-medium text-gray-800 mb-2">Uploaded Document</h2>
                        <div className="border rounded-md overflow-hidden">
                            {response.data.resourceType === 'image' ? (
                                <img src={response.data.url} alt="Uploaded Document" className="w-full h-auto" />
                            ) : (
                                <iframe src={response.data.url} title="Uploaded Document" className="w-full h-64" />
                            )}
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    )
}

export default Test
