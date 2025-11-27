"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "ADMIN") {
            router.push("/admin/login");
            return;
        }

        // Fetch admin profile data
        const fetchProfile = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/v1/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch profile");

                const data = await response.json();
                setAdminData(data.user);
            } catch (err) {
                console.error(err);
                router.push("/admin/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome, {adminData?.username}!
                </h1>
                <p className="text-gray-400">
                    Manage your platform from this admin dashboard.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
                    <h3 className="text-blue-400 text-sm font-medium mb-2">Total Users</h3>
                </div>
                <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6">
                    <h3 className="text-purple-400 text-sm font-medium mb-2">Game Levels</h3>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition">
                        View All Users
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-md transition">
                        Manage Incidents
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-md transition">
                        Edit Game Levels
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-md transition">
                        System Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
