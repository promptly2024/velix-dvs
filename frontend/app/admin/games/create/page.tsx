/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateLevelPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        levelNumber: "",
        title: "",
        description: "",
        type: "EASY" as "EASY" | "MEDIUM" | "HARD",
        requiredScore: "",
        basePoints: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3001/api/v1/admin/levels", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    levelNumber: parseInt(formData.levelNumber),
                    title: formData.title,
                    description: formData.description || undefined,
                    type: formData.type,
                    requiredScore: parseInt(formData.requiredScore),
                    basePoints: parseInt(formData.basePoints),
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Level created successfully!");
                router.push(`/admin/games/${formData.levelNumber}`);
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
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
                >
                    ← Back
                </button>
                <h1 className="text-3xl font-bold text-white">Create New Game Level</h1>
                <p className="text-gray-400 mt-2">Add a new level to the gamified learning system</p>
            </div>

            {/* Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                {error && (
                    <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Level Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Level Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.levelNumber}
                            onChange={(e) => setFormData({ ...formData, levelNumber: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="OTP Theft Awareness"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Recognize and block OTP theft attempts..."
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Difficulty Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </div>

                    {/* Required Score */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Required Score <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.requiredScore}
                            onChange={(e) => setFormData({ ...formData, requiredScore: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="80"
                        />
                    </div>

                    {/* Base Points */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Base Points <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.basePoints}
                            onChange={(e) => setFormData({ ...formData, basePoints: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="100"
                        />
                    </div>

                    {/* Submit Button */}
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
                            {loading ? "Creating..." : "Create Level"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
