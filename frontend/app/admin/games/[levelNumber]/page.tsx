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
}

export default function LevelDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const levelNumber = params.levelNumber as string;

    const [level, setLevel] = useState<LevelDetails | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [loading, setLoading] = useState(true);
    const [scenesLoading, setScenesLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchLevelDetails();
    }, [levelNumber]);

    const fetchLevelDetails = async () => {
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
                setLevel(data.data);
                await fetchScenes(data.data.id);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch level details");
        } finally {
            setLoading(false);
        }
    };

    const fetchScenes = async (levelId: string) => {
        try {
            setScenesLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/scene/level/${levelId}/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            
            if (response.ok && data.success) {
                setScenes(data.data); 
            } else if (response.status === 404) {
                setScenes([]);
            } else {
                console.error("Failed to fetch scenes:", data.message);
                setScenes([]);
            }
        } catch (err: any) {
            console.error("Error fetching scenes:", err);
            setScenes([]);
        } finally {
            setScenesLoading(false);
        }
    };

    // DELETE SCENE
    const handleDeleteScene = async (sceneId: string, sceneNumber: number) => {
        if (!window.confirm(`Are you sure you want to delete Scene ${sceneNumber}? This will also delete all questions and options within it.`)) {
            return;
        }

        try {
            setDeleting(sceneId);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/scene/${sceneId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Remove scene from state
                setScenes(scenes.filter(s => s.id !== sceneId));
                alert("Scene deleted successfully");
            } else {
                alert(data.message || "Failed to delete scene");
            }
        } catch (err: any) {
            alert(err.message || "Error deleting scene");
        } finally {
            setDeleting(null);
        }
    };

    // DELETE QUESTION
    const handleDeleteQuestion = async (queryId: string, sceneId: string, queryNumber: number) => {
        if (!window.confirm(`Are you sure you want to delete Question ${queryNumber}? This will also delete all its options.`)) {
            return;
        }

        try {
            setDeleting(queryId);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/question/${queryId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Remove query from state
                setScenes(scenes.map(scene => {
                    if (scene.id === sceneId) {
                        return {
                            ...scene,
                            queries: scene.queries.filter(q => q.id !== queryId)
                        };
                    }
                    return scene;
                }));
                alert("Question deleted successfully");
            } else {
                alert(data.message || "Failed to delete question");
            }
        } catch (err: any) {
            alert(err.message || "Error deleting question");
        } finally {
            setDeleting(null);
        }
    };

    // DELETE OPTION
    const handleDeleteOption = async (optionId: string, sceneId: string, queryId: string, optionText: string) => {
        if (!window.confirm(`Are you sure you want to delete option: "${optionText}"?`)) {
            return;
        }

        try {
            setDeleting(optionId);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:3001/api/v1/admin/option/${optionId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Remove option from state
                setScenes(scenes.map(scene => {
                    if (scene.id === sceneId) {
                        return {
                            ...scene,
                            queries: scene.queries.map(query => {
                                if (query.id === queryId) {
                                    return {
                                        ...query,
                                        options: query.options.filter(opt => opt.id !== optionId)
                                    };
                                }
                                return query;
                            })
                        };
                    }
                    return scene;
                }));
                alert("Option deleted successfully");
            } else {
                alert(data.message || "Failed to delete option");
            }
        } catch (err: any) {
            alert(err.message || "Error deleting option");
        } finally {
            setDeleting(null);
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
                <Link
                    href="/admin/games"
                    className="text-blue-400 hover:text-blue-300 mb-4 items-center gap-2 inline-flex"
                >
                    ← Back to Levels
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Level {level.levelNumber}: {level.title}
                        </h1>
                        <p className="text-gray-400 mt-2">
                            {level.description || "No description"}
                        </p>
                    </div>
                    <Link
                        href={`/admin/games/${levelNumber}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
                    >
                        Edit Level
                    </Link>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded">
                    {error}
                </div>
            )}

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
                    <div className="text-white font-semibold text-lg">
                        {scenesLoading ? "..." : scenes.length}
                    </div>
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

                {scenesLoading ? (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                        <p className="text-gray-400">Loading scenes...</p>
                    </div>
                ) : scenes.length === 0 ? (
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
                        {scenes.map((scene) => (
                            <div
                                key={scene.id}
                                className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Scene {scene.sceneNumber}
                                        </h3>
                                        <span className="text-sm text-gray-400">
                                            Type: {scene.sceneType}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/games/${levelNumber}/scenes/${scene.id}/questions/create`}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition"
                                        >
                                            + Add Question
                                        </Link>
                                        <Link
                                            href={`/admin/games/${levelNumber}/scenes/${scene.id}/edit`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteScene(scene.id, scene.sceneNumber)}
                                            disabled={deleting === scene.id}
                                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm transition"
                                        >
                                            {deleting === scene.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>

                                {/* Media Preview */}
                                {scene.sceneType === "TEXT" && scene.mediaUrls.length > 0 && (
                                    <div className="bg-gray-700 border border-gray-600 rounded p-4 mb-4">
                                        <p className="text-gray-300 text-sm">
                                            {scene.mediaUrls[0]}
                                        </p>
                                    </div>
                                )}

                                {scene.sceneType === "VIDEO" && scene.mediaUrls.length > 0 && (
                                    <div className="mb-4">
                                        <video
                                            controls
                                            className="w-full max-w-2xl rounded-lg"
                                            src={scene.mediaUrls[0]}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}

                                {scene.sceneType === "IMAGES" && scene.mediaUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {scene.mediaUrls.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`Scene ${scene.sceneNumber} - Image ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-600"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Queries */}
                                <div className="space-y-4 mt-4">
                                    <h4 className="text-md font-semibold text-white">
                                        Questions ({scene.queries?.length || 0})
                                    </h4>
                                    {scene.queries && scene.queries.length > 0 ? (
                                        scene.queries.map((query) => (
                                            <div
                                                key={query.id}
                                                className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                                            >
                                                {/* Question Header with Buttons */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-white font-medium flex-1">
                                                        Q{query.queryNumber}: {query.questionText}
                                                    </p>
                                                    <div className="flex gap-2 ml-4">
                                                        <Link
                                                            href={`/admin/games/${levelNumber}/questions/${query.id}/options/create`}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
                                                        >
                                                            + Add Option
                                                        </Link>
                                                        <Link
                                                            href={`/admin/games/${levelNumber}/questions/${query.id}/edit`}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(query.id, scene.id, query.queryNumber)}
                                                            disabled={deleting === query.id}
                                                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs transition"
                                                        >
                                                            {deleting === query.id ? "..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Hint */}
                                                {query.hintText && (
                                                    <p className="text-sm text-gray-400 mb-2">
                                                        💡 Hint: {query.hintText}
                                                    </p>
                                                )}

                                                {/* Learning Outcome */}
                                                {query.learningOutcome && (
                                                    <p className="text-sm text-blue-400 mb-3">
                                                        📚 Learning: {query.learningOutcome}
                                                    </p>
                                                )}

                                                {/* Options */}
                                                <div className="space-y-2">
                                                    {query.options && query.options.length > 0 ? (
                                                        query.options.map((option, idx) => (
                                                            <div
                                                                key={option.id}
                                                                className={`p-3 rounded ${
                                                                    option.isCorrect
                                                                        ? "bg-green-900/30 border border-green-700"
                                                                        : "bg-gray-800 border border-gray-600"
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <span className="text-white">
                                                                            {String.fromCharCode(65 + idx)}.{" "}
                                                                            {option.optionText}
                                                                        </span>
                                                                        {option.isCorrect && (
                                                                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                                                                ✓ Correct
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-sm text-gray-400">
                                                                            {option.pointsAwarded} pts
                                                                        </span>
                                                                        <Link
                                                                            href={`/admin/games/${levelNumber}/options/${option.id}/edit`}
                                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleDeleteOption(option.id, scene.id, query.id, option.optionText)}
                                                                            disabled={deleting === option.id}
                                                                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs transition"
                                                                        >
                                                                            {deleting === option.id ? "..." : "Delete"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-4 bg-gray-800 border border-gray-600 rounded">
                                                            <p className="text-gray-400 text-sm mb-2">
                                                                No options created yet
                                                            </p>
                                                            <Link
                                                                href={`/admin/games/${levelNumber}/questions/${query.id}/options/create`}
                                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs transition inline-block"
                                                            >
                                                                Create First Option
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 bg-gray-700 border border-gray-600 rounded">
                                            <p className="text-gray-400 text-sm mb-2">
                                                No questions created yet
                                            </p>
                                            <Link
                                                href={`/admin/games/${levelNumber}/scenes/${scene.id}/questions/create`}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition inline-block"
                                            >
                                                Create First Question
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
