"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function CreateScenePage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = params.levelNumber as string;
    
    const [formData, setFormData] = useState({
        sceneNumber: "",
        sceneType: "TEXT" as "VIDEO" | "IMAGES" | "TEXT",
        textContent: "",
    });
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [levelData, setLevelData] = useState<any>(null);

    useEffect(() => {
        fetchLevelData();
    }, []);

    const fetchLevelData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3001/api/v1/admin/levels/${levelNumber}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setLevelData(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const formDataToSend = new FormData();
            
            formDataToSend.append("levelId", levelData.id);
            formDataToSend.append("sceneNumber", formData.sceneNumber);
            formDataToSend.append("sceneType", formData.sceneType);

            if (formData.sceneType === "TEXT") {
                formDataToSend.append("textContent", formData.textContent);
            } else if (files) {
                Array.from(files).forEach((file) => {
                    formDataToSend.append("media", file);
                });
            }

            const response = await fetch("http://localhost:3001/api/v1/admin/scene", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.success) {
                alert("Scene created successfully!");
                router.push(`/admin/games/${levelNumber}`);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
                >
                    ← Back
                </button>
                <h1 className="text-3xl font-bold text-white">Create New Scene</h1>
                <p className="text-gray-400 mt-2">Add a scene to Level {levelNumber}</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                {error && (
                    <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Scene Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Scene Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.sceneNumber}
                            onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1"
                        />
                    </div>

                    {/* Scene Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Scene Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.sceneType}
                            onChange={(e) => setFormData({ ...formData, sceneType: e.target.value as any })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="TEXT">Text</option>
                            <option value="VIDEO">Video</option>
                            <option value="IMAGES">Images</option>
                        </select>
                    </div>

                    {/* Conditional Fields Based on Scene Type */}
                    {formData.sceneType === "TEXT" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Text Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.textContent}
                                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={6}
                                placeholder="Enter the text content for this scene..."
                            />
                        </div>
                    )}

                    {formData.sceneType === "VIDEO" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Video File <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                required
                                accept="video/*"
                                onChange={(e) => setFiles(e.target.files)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-400 mt-2">Upload one video file</p>
                        </div>
                    )}

                    {formData.sceneType === "IMAGES" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Image Files <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                required
                                multiple
                                accept="image/*"
                                onChange={(e) => setFiles(e.target.files)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-400 mt-2">Upload up to 10 images</p>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Scene"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
