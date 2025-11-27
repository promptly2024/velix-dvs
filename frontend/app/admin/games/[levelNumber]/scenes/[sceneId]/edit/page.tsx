"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface SceneData {
    id: string;
    levelId: string;
    sceneNumber: number;
    sceneType: "VIDEO" | "IMAGES" | "TEXT";
    mediaUrls: string[];
}

export default function EditScenePage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = params.levelNumber as string;
    const sceneId = params.sceneId as string;

    const [scene, setScene] = useState<SceneData | null>(null);
    const [sceneNumber, setSceneNumber] = useState<number>(1);
    const [sceneType, setSceneType] = useState<"VIDEO" | "IMAGES" | "TEXT">("TEXT");
    const [textContent, setTextContent] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSceneDetails(sceneId);
    }, []);

    useEffect(() => {
        if (files) {
            const urls: string[] = [];
            Array.from(files).forEach((file) => {
                urls.push(URL.createObjectURL(file));
            });
            setPreviewUrls(urls);
            return () => {
                urls.forEach((url) => URL.revokeObjectURL(url));
            };
        }
    }, [files]);

    const fetchSceneDetails = async (sceneId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/scene/${sceneId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (data.success) {
                const scenes = Array.isArray(data.data) ? data.data : [data.data];
                const currentScene = scenes.find((s: SceneData) => s.id === sceneId);
                
                if (currentScene) {
                    setScene(currentScene);
                    setSceneNumber(currentScene.sceneNumber);
                    setSceneType(currentScene.sceneType);
                    
                    if (currentScene.sceneType === "TEXT" && currentScene.mediaUrls.length > 0) {
                        setTextContent(currentScene.mediaUrls[0]);
                    }
                }
            }
        } catch (err: any) {
            console.error("Error fetching scene details:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            setFiles(selectedFiles);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();

            formData.append("sceneNumber", sceneNumber.toString());
            formData.append("sceneType", sceneType);

            if (sceneType === "TEXT") {
                formData.append("textContent", textContent);
            } else if (files && files.length > 0) {
                Array.from(files).forEach((file) => {
                    formData.append("media", file);
                });
            }

            const response = await fetch(
                `http://localhost:3001/api/v1/admin/scene/${sceneId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.success) {
                router.push(`/admin/games/${levelNumber}`);
            } else {
                setError(data.message || "Failed to update scene");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!scene) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-white mb-4">Scene Not Found</h2>
                <Link
                    href={`/admin/games/${levelNumber}`}
                    className="text-blue-400 hover:text-blue-300"
                >
                    ← Back to Level
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/games/${levelNumber}`}
                    className="text-gray-400 hover:text-white transition"
                >
                    ← Back
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Scene {scene.sceneNumber}</h1>
                    <p className="text-gray-400 mt-2">Update scene content and settings</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
                {/* Scene Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Scene Number *
                    </label>
                    <input
                        type="number"
                        value={sceneNumber}
                        onChange={(e) => setSceneNumber(parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>

                {/* Scene Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Scene Type *
                    </label>
                    <select
                        value={sceneType}
                        onChange={(e) => setSceneType(e.target.value as "VIDEO" | "IMAGES" | "TEXT")}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                        required
                    >
                        <option value="TEXT">Text Content</option>
                        <option value="VIDEO">Video</option>
                        <option value="IMAGES">Images</option>
                    </select>
                </div>

                {/* Current Media Preview */}
                {scene.mediaUrls && scene.mediaUrls.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Media
                        </label>
                        {scene.sceneType === "TEXT" && (
                            <div className="bg-gray-700 border border-gray-600 rounded p-4">
                                <p className="text-gray-300 text-sm">{scene.mediaUrls[0]}</p>
                            </div>
                        )}
                        {scene.sceneType === "VIDEO" && (
                            <video
                                controls
                                className="w-full max-w-2xl rounded-lg"
                                src={scene.mediaUrls[0]}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                        {scene.sceneType === "IMAGES" && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {scene.mediaUrls.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`Current image ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-600"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Content Based on Type */}
                {sceneType === "TEXT" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Text Content *
                        </label>
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            rows={6}
                            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Enter text content for this scene"
                            required
                        />
                    </div>
                )}

                {sceneType === "VIDEO" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Upload New Video (Optional)
                        </label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty to keep current video
                        </p>
                        {previewUrls.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2">New Video Preview:</p>
                                <video
                                    controls
                                    className="w-full max-w-2xl rounded-lg"
                                    src={previewUrls[0]}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                )}

                {sceneType === "IMAGES" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Upload New Images (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Maximum 10 images. Leave empty to keep current images.
                        </p>
                        {previewUrls.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2">New Images Preview:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewUrls.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition"
                    >
                        {submitting ? "Updating..." : "Update Scene"}
                    </button>
                    <Link
                        href={`/admin/games/${levelNumber}`}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
