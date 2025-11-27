"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface NavbarProps {
    isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        
        if (token) {
            setIsLoggedIn(true);
            setUsername(storedUsername || "User");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        setIsLoggedIn(false);
        router.push(isAdmin ? "/admin/login" : "/login");
    };

    const navLinks = isAdmin
        ? [
              { href: "/admin/dashboard", label: "Dashboard" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/games", label: "Games" },
              { href: "/admin/incidents", label: "Incidents" },
          ]
        : [
              { href: "/dashboard", label: "Dashboard" },
              { href: "/levels", label: "Levels" },
              { href: "/profile", label: "Profile" },
          ];

    return (
        <nav className="bg-gray-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link 
                            href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                            className="text-xl font-bold text-blue-400 hover:text-blue-300 transition"
                        >
                            {isAdmin ? "Velix Admin" : "Velix DVS"}
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                    pathname === link.href
                                        ? "bg-gray-800 text-blue-400"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                <span className="text-sm text-gray-300">
                                    Welcome, <span className="font-semibold">{username}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href={isAdmin ? "/admin/login" : "/login"}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
