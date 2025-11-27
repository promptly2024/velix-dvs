"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

// Validation schema matching your backend
const createLevelSchema = z.object({
    levelNumber: z.number().int(),
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    type: z.enum(['EASY', 'MEDIUM', 'HARD']),
    requiredScore: z.number().int().min(1, "Required score must be at least 1"),
    basePoints: z.number().int().min(0, "Base points must be at least 0")
});

type LevelFormData = z.infer<typeof createLevelSchema>;

export default function EditLevelPage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = parseInt(params.levelNumber as string, 10);

    const [formData, setFormData] = useState<LevelFormData>({
        levelNumber: 0,
        title: "",
        description: "",
        type: "EASY",
        requiredScore: 0,
        basePoints: 0
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchLevel();
    }, [levelNumber]);

    const fetchLevel = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/levels/${levelNumber}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            if (data.success) {
                setFormData({
                    levelNumber: data.data.levelNumber,
                    title: data.data.title,
                    description: data.data.description || "",
                    type: data.data.type,
                    requiredScore: data.data.requiredScore,
                    basePoints: data.data.basePoints
                });
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch level");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "levelNumber" || name === "requiredScore" || name === "basePoints"
                ? parseInt(value) || 0
                : value
        }));
        // Clear field error on change
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = (): boolean => {
        try {
            createLevelSchema.parse(formData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0].toString()] = issue.message;
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/levels/${levelNumber}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (data.success) {
                router.push("/admin/games");
            } else {
                setError(data.message || "Failed to update level");
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

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/games"
                    className="text-gray-400 hover:text-white transition"
                >
                    ← Back
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Level {levelNumber}</h1>
                    <p className="text-gray-400 mt-2">Update level configuration and settings</p>
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
                {/* Level Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Level Number *
                    </label>
                    <input
                        type="number"
                        name="levelNumber"
                        value={formData.levelNumber}
                        onChange={handleInputChange}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 text-gray-400 px-4 py-2 rounded focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Level number cannot be changed</p>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900 border ${
                            errors.title ? "border-red-500" : "border-gray-700"
                        } text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500`}
                        placeholder="Enter level title"
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Enter level description (optional)"
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty Type *
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900 border ${
                            errors.type ? "border-red-500" : "border-gray-700"
                        } text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500`}
                    >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                    {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
                </div>

                {/* Required Score & Base Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Required Score *
                        </label>
                        <input
                            type="number"
                            name="requiredScore"
                            value={formData.requiredScore}
                            onChange={handleInputChange}
                            min="1"
                            className={`w-full bg-gray-900 border ${
                                errors.requiredScore ? "border-red-500" : "border-gray-700"
                            } text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500`}
                            placeholder="0"
                        />
                        {errors.requiredScore && (
                            <p className="text-red-400 text-sm mt-1">{errors.requiredScore}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Base Points *
                        </label>
                        <input
                            type="number"
                            name="basePoints"
                            value={formData.basePoints}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full bg-gray-900 border ${
                                errors.basePoints ? "border-red-500" : "border-gray-700"
                            } text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500`}
                            placeholder="0"
                        />
                        {errors.basePoints && (
                            <p className="text-red-400 text-sm mt-1">{errors.basePoints}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-medium transition"
                    >
                        {submitting ? "Updating..." : "Update Level"}
                    </button>
                    <Link
                        href="/admin/games"
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
