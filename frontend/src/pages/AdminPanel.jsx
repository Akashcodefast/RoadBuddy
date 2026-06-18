import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const AdminPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("stats"); // stats | users | requests
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // guard — non-admins can't see this page
        if (user && user.role !== "admin") {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes, reqRes] = await Promise.all([
                    api.get("/users/admin/stats"),
                    api.get("/users/admin/all"),
                    api.get("/users/admin/requests"),
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setRequests(reqRes.data);
            } catch (err) {
                console.error("Admin fetch error:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleBlock = async (userId) => {
        try {
            const res = await api.patch(`/users/admin/${userId}/block`);
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.data.isBlocked } : u))
            );
        } catch (err) {
            console.error("Block toggle error:", err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-purple-400 animate-pulse font-bold">Loading admin panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
            <div className="max-w-3xl mx-auto">

                {/* header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate("/profile")}
                        className="text-gray-400 hover:text-white transition text-xl"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">👑 Admin Panel</h1>
                        <p className="text-gray-400 text-sm">Manage RoadBuddy platform</p>
                    </div>
                </div>

                {/* tabs */}
                <div className="flex gap-2 mb-6">
                    {["stats", "users", "requests"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === t
                                ? "bg-purple-500 text-white"
                                : "bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600"
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* STATS TAB */}
                {tab === "stats" && stats && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-gray-400 text-xs mb-1">Total Users</p>
                            <p className="text-3xl font-bold text-orange-400">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-gray-400 text-xs mb-1">Online Now</p>
                            <p className="text-3xl font-bold text-green-400">{stats.onlineUsers}</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-gray-400 text-xs mb-1">Total Requests</p>
                            <p className="text-3xl font-bold text-blue-400">{stats.totalRequests}</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <p className="text-gray-400 text-xs mb-1">Pending</p>
                            <p className="text-3xl font-bold text-yellow-400">{stats.pendingRequests}</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 col-span-2">
                            <p className="text-gray-400 text-xs mb-1">Completed Requests</p>
                            <p className="text-3xl font-bold text-purple-400">{stats.completedRequests}</p>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {tab === "users" && (
                    <div className="space-y-3">
                        {users.map((u) => (
                            <div
                                key={u._id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center font-bold text-orange-400">
                                    {u.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">
                                        {u.name}{" "}
                                        {u.role === "admin" && (
                                            <span className="text-purple-400 text-xs">👑</span>
                                        )}
                                    </p>
                                    <p className="text-gray-500 text-xs">{u.email} · {u.phone}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isOnline ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-500"
                                            }`}>
                                            {u.isOnline ? "● Online" : "○ Offline"}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                                            ⭐ {u.rating || "New"}
                                        </span>
                                    </div>
                                </div>
                                {u.role !== "admin" && (
                                    <button
                                        onClick={() => handleToggleBlock(u._id)}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${u.isBlocked
                                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                            }`}
                                    >
                                        {u.isBlocked ? "Blocked" : "Block"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* REQUESTS TAB */}
                {tab === "requests" && (
                    <div className="space-y-3">
                        {requests.map((r) => (
                            <div
                                key={r._id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-sm">{r.issueType}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "completed" ? "bg-green-500/10 text-green-400" :
                                        r.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                                            r.status === "accepted" ? "bg-blue-500/10 text-blue-400" :
                                                "bg-gray-800 text-gray-500"
                                        }`}>
                                        {r.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs">
                                    By {r.userId?.name || "Unknown"}
                                    {r.helperId && ` · Helped by ${r.helperId.name}`}
                                </p>
                                <p className="text-gray-600 text-xs mt-1">
                                    {new Date(r.createdAt).toLocaleString("en-IN")}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminPanel;