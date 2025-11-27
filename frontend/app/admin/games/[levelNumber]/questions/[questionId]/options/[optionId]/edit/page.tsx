"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function CreateOptionPage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = params.levelNumber as string;
    const questionId = params.questionId as string; // Frontend uses questionId

    const [formData, setFormData] = useState({
        optionText: "",
        isCorrect: false,
        pointsAwarded: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3001/api/v1/admin/option", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    queryId: questionId, // Send as queryId to backend
                    optionText: formData.optionText,
                    isCorrect: formData.isCorrect,
                    pointsAwarded: formData.pointsAwarded,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push(`/admin/games/${levelNumber}`);
                router.refresh();
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <Link
                    href={`/admin/games/${levelNumber}`}
                    className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
                >
                    ← Back to Level
                </Link>
                <h1 className="text-3xl font-bold text-white">Create New Option</h1>
                <p className="text-gray-400 mt-2">Add an answer option to the question</p>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
                {/* Option Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Option Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        value={formData.optionText}
                        onChange={(e) => setFormData({ ...formData, optionText: e.target.value })}
                        rows={3}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Enter option text"
                    />
                </div>

                {/* Is Correct Checkbox */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isCorrect"
                        checked={formData.isCorrect}
                        onChange={(e) => setFormData({ ...formData, isCorrect: e.target.checked })}
                        className="w-5 h-5 bg-gray-900 border border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="isCorrect" className="text-sm font-medium text-gray-300 cursor-pointer">
                        This is the correct answer
                    </label>
                </div>

                {/* Points Awarded */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Points Awarded <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        required
                        value={formData.pointsAwarded}
                        onChange={(e) => setFormData({ ...formData, pointsAwarded: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                        placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Points can be 0 for incorrect answers or positive for correct/partial credit
                    </p>
                </div>

                {/* Action Buttons */}
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition"
                    >
                        {loading ? "Creating..." : "Create Option"}
                    </button>
                </div>
            </form>
        </div>
    );
}
