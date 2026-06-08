import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useLiveLocation from "../hooks/useLiveLocation";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const coords = useLiveLocation();
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg">
              🛣️
            </div>
            <span className="text-white text-xl font-bold">RoadBuddy</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* welcome */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm">Welcome back 👋</p>
          <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-500 rounded-2xl p-6 cursor-pointer hover:bg-orange-400 transition">
            <div className="text-2xl mb-2">🆘</div>
            <div className="font-bold text-white">Request Help</div>
            <div className="text-orange-100 text-sm mt-1">Get nearby assistance</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-orange-500 transition">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-bold">My Requests</div>
            <div className="text-gray-400 text-sm mt-1">View history</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-orange-500 transition">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-bold">Profile</div>
            <div className="text-gray-400 text-sm mt-1">Edit details</div>
          </div>

          <div className="bg-red-600 rounded-2xl p-6 cursor-pointer hover:bg-red-500 transition">
            <div className="text-2xl mb-2">📡</div>
            <div className="font-bold text-white">SOS</div>
            <div className="text-red-100 text-sm mt-1">Emergency alert</div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mt-4 text-sm text-gray-400">
          📍 Your location: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Fetching..."}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;