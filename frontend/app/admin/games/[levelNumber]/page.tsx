"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Scene {
    id: string;
    sceneNumber: number;
    sceneType: "VIDEO" | "IMAGES" | "TEXT";
    mediaUrls: string[];
    queries: Query[];
}

interface Query {
    id: string;
    queryNumber: number;
    questionText: string;
    learningOutcome: string | null;
    hintText: string | null;
    options: Option[];
}

interface Option {
    id: string;
    optionText: string;
    isCorrect: boolean;
    pointsAwarded: number;
}

interface LevelDetails {
    id: string;
    levelNumber: number;
    title: string;
    description: string | null;
    type: "EASY" | "MEDIUM" | "HARD";
    requiredScore: number;
    basePoints: number;
    scenes: Scene[];
}

export default function LevelDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = params.levelNumber as string;

    const [level, setLevel] = useState<LevelDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLevelDetails();
    }, [levelNumber]);

    const fetchLevelDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3001/api/v1/admin/levels/${levelNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setLevel(data.data);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!level) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-white mb-4">Level Not Found</h2>
                <Link href="/admin/games" className="text-blue-400 hover:text-blue-300">
                    ← Back to Levels
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/admin/games" className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2">
                    ← Back to Levels
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Level {level.levelNumber}: {level.title}</h1>
                        <p className="text-gray-400 mt-2">{level.description}</p>
                    </div>
                    <Link
                        href={`/admin/games/${levelNumber}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
                    >
                        Edit Level
                    </Link>
                </div>
            </div>

            {/* Level Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Difficulty</div>
                    <div className="text-white font-semibold text-lg">{level.type}</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Required Score</div>
                    <div className="text-white font-semibold text-lg">{level.requiredScore}</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Base Points</div>
                    <div className="text-white font-semibold text-lg">{level.basePoints}</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Scenes</div>
                    <div className="text-white font-semibold text-lg">{level.scenes.length}</div>
                </div>
            </div>

            {/* Scenes */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-white">Scenes</h2>
                    <Link
                        href={`/admin/games/${levelNumber}/scenes/create`}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                    >
                        + Add Scene
                    </Link>
                </div>

                {level.scenes.length === 0 ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                        <p className="text-gray-400 mb-4">No scenes created yet</p>
                        <Link
                            href={`/admin/games/${levelNumber}/scenes/create`}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition inline-block"
                        >
                            Create First Scene
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {level.scenes.map((scene) => (
                            <div key={scene.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Scene {scene.sceneNumber}</h3>
                                        <span className="text-sm text-gray-400">Type: {scene.sceneType}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/games/${levelNumber}/scenes/${scene.id}/edit`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </div>

                                {/* Queries */}
                                <div className="space-y-4 mt-4">
                                    <h4 className="text-md font-semibold text-white">Questions ({scene.queries.length})</h4>
                                    {scene.queries.map((query) => (
                                        <div key={query.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-white font-medium">Q{query.queryNumber}: {query.questionText}</p>
                                            </div>
                                            {query.hintText && (
                                                <p className="text-sm text-gray-400 mb-2">💡 Hint: {query.hintText}</p>
                                            )}
                                            {query.learningOutcome && (
                                                <p className="text-sm text-blue-400 mb-3">📚 Learning: {query.learningOutcome}</p>
                                            )}
                                            <div className="space-y-2">
                                                {query.options.map((option, idx) => (
                                                    <div
                                                        key={option.id}
                                                        className={`p-3 rounded ${
                                                            option.isCorrect
                                                                ? "bg-green-900/30 border border-green-700"
                                                                : "bg-gray-800 border border-gray-600"
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white">{String.fromCharCode(65 + idx)}. {option.optionText}</span>
                                                            <span className="text-sm text-gray-400">{option.pointsAwarded} pts</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
