"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CreateQuestionPage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = params.levelNumber as string;
    const sceneId = params.sceneId as string;

    const [formData, setFormData] = useState({
        queryNumber: "",
        questionText: "",
        learningOutcome: "",
        hintText: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3001/api/v1/admin/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sceneId,
                    queryNumber: parseInt(formData.queryNumber) || undefined,
                    questionText: formData.questionText,
                    learningOutcome: formData.learningOutcome || undefined,
                    hintText: formData.hintText || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Question created successfully!");
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
                <h1 className="text-3xl font-bold text-white">Create New Question</h1>
                <p className="text-gray-400 mt-2">Add a question to the scene</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                {error && (
                    <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Query Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Question Number (Optional)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.queryNumber}
                            onChange={(e) => setFormData({ ...formData, queryNumber: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1"
                        />
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            value={formData.questionText}
                            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="What is the safest action?"
                        />
                    </div>

                    {/* Learning Outcome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Learning Outcome (Optional)
                        </label>
                        <textarea
                            value={formData.learningOutcome}
                            onChange={(e) => setFormData({ ...formData, learningOutcome: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Never share OTP with anyone..."
                        />
                    </div>

                    {/* Hint Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Hint Text (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.hintText}
                            onChange={(e) => setFormData({ ...formData, hintText: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Think about security..."
                        />
                    </div>

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
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
