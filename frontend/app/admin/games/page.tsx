"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GameLevel {
    id: string;
    levelNumber: number;
    title: string;
    description: string | null;
    type: "EASY" | "MEDIUM" | "HARD";
    requiredScore: number;
    basePoints: number;
}

export default function AdminGamesPage() {
    const router = useRouter();
    const [levels, setLevels] = useState<GameLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3001/api/v1/admin/levels", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setLevels(data.data);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // DELETE LEVEL HANDLER
    const handleDeleteLevel = async (levelNumber: number, levelTitle: string) => {
        if (!window.confirm(
            `Are you sure you want to delete Level ${levelNumber}: "${levelTitle}"?\n\n` +
            `This will permanently delete:\n` +
            `- The level\n` +
            `- All scenes within it\n` +
            `- All questions and options\n\n` +
            `This action cannot be undone!`
        )) {
            return;
        }

        try {
            setDeleting(levelNumber);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/levels/${levelNumber}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Remove level from state
                setLevels(levels.filter(l => l.levelNumber !== levelNumber));
                alert("Level deleted successfully");
            } else {
                alert(data.message || "Failed to delete level");
            }
        } catch (err: any) {
            alert(err.message || "Error deleting level");
        } finally {
            setDeleting(null);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "EASY": return "bg-green-900/30 text-green-400 border-green-700";
            case "MEDIUM": return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
            case "HARD": return "bg-red-900/30 text-red-400 border-red-700";
            default: return "bg-gray-900/30 text-gray-400 border-gray-700";
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Game Levels Management</h1>
                    <p className="text-gray-400 mt-2">Create and manage gamified learning levels</p>
                </div>
                <Link
                    href="/admin/games/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
                >
                    + Create New Level
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Levels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.map((level) => (
                    <div
                        key={level.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-600 transition"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold">
                                    {level.levelNumber}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{level.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(level.type)}`}>
                                        {level.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {level.description || "No description"}
                        </p>

                        <div className="flex items-center justify-between text-sm mb-4">
                            <div>
                                <span className="text-gray-500">Required Score:</span>
                                <span className="text-white font-semibold ml-2">{level.requiredScore}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Base Points:</span>
                                <span className="text-white font-semibold ml-2">{level.basePoints}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/games/${level.levelNumber}`}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-center text-sm transition"
                                >
                                    View Details
                                </Link>
                                <Link
                                    href={`/admin/games/${level.levelNumber}/edit`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center text-sm transition"
                                >
                                    Edit
                                </Link>
                            </div>
                            <button
                                onClick={() => handleDeleteLevel(level.levelNumber, level.title)}
                                disabled={deleting === level.levelNumber}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition"
                            >
                                {deleting === level.levelNumber ? "Deleting..." : "Delete Level"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {levels.length === 0 && !loading && (
                <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-2">No Levels Created Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first game level to get started</p>
                    <Link
                        href="/admin/games/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition inline-block"
                    >
                        Create First Level
                    </Link>
                </div>
            )}
        </div>
    );
}
