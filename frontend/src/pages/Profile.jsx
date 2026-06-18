import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import useAuth                 from "../hooks/useAuth";
import api                     from "../services/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const [form, setForm] = useState({
    name:          "",
    phone:         "",
    vehicleType:   "",
    vehicleNumber: "",
  });
  const [stats,    setStats   ] = useState(null);
  const [editing,  setEditing ] = useState(false);
  const [loading,  setLoading ] = useState(false);
  const [message,  setMessage ] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setStats(res.data);
        setForm({
          name:          res.data.name  || "",
          phone:         res.data.phone || "",
          vehicleType:   res.data.vehicle?.vehicleType   || "",
          vehicleNumber: res.data.vehicle?.vehicleNumber || "",
        });
      } catch (err) {
        console.error("Fetch profile error:", err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.patch("/users/profile", form);
      setStats(res.data);
      setEditing(false);
      setMessage("Profile updated!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 animate-pulse font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-lg mx-auto">

        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-white transition text-xl"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>

        {/* avatar + name */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-5 text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
            {stats.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{stats.name}</h2>
          <p className="text-gray-400 text-sm">{stats.email}</p>
          {stats.role === "admin" && (
            <span className="inline-block mt-2 bg-purple-500/15 text-purple-400 text-xs px-3 py-1 rounded-full font-medium">
              👑 Admin
            </span>
          )}
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">⭐ {stats.rating || "New"}</p>
            <p className="text-gray-500 text-xs mt-1">{stats.totalRatings} ratings</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.totalHelps}</p>
            <p className="text-gray-500 text-xs mt-1">People helped</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.totalRequests || 0}</p>
            <p className="text-gray-500 text-xs mt-1">Requests made</p>
          </div>
        </div>

        {/* message */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">
            {message}
          </div>
        )}

        {/* edit form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold">Personal Details</p>
            <button
              onClick={() => setEditing(!editing)}
              className="text-orange-400 text-sm hover:text-orange-300 transition"
            >
              {editing ? "Cancel" : "✏️ Edit"}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!editing}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!editing}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition disabled:opacity-60"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition disabled:opacity-60"
                >
                  <option value="">Select</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Vehicle Number</label>
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {editing && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* admin panel link */}
        {stats.role === "admin" && (
          <button
            onClick={() => navigate("/admin")}
            className="w-full bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-400 font-semibold py-3 rounded-xl transition mb-3"
          >
            👑 Open Admin Panel
          </button>
        )}

        {/* logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-gray-900 border border-gray-800 hover:border-red-500 text-gray-400 hover:text-red-400 font-semibold py-3 rounded-xl transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;