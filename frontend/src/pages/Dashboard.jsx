import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useLiveLocation from "../hooks/useLiveLocation";
import IncomingRequest from "../components/IncomingRequest";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const coords           = useLiveLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-lg mx-auto">

        {/* navbar */}
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <p className="text-gray-400 text-sm">Welcome back 👋</p>
          <h1 className="text-2xl font-bold mt-1">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs">Online — visible to nearby users</span>
          </div>
          {coords && (
            <p className="text-gray-500 text-xs mt-1">
              📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* action cards */}
        <div className="grid grid-cols-2 gap-4">

          <button
            onClick={() => navigate("/request")}
            className="bg-orange-500 hover:bg-orange-400 transition rounded-2xl p-6 text-left"
          >
            <div className="text-2xl mb-2">🆘</div>
            <div className="font-bold text-white">Request Help</div>
            <div className="text-orange-100 text-sm mt-1">Get nearby assistance</div>
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500 transition rounded-2xl p-6 text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-bold">My Requests</div>
            <div className="text-gray-400 text-sm mt-1">View history</div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500 transition rounded-2xl p-6 text-left"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-bold">Profile</div>
            <div className="text-gray-400 text-sm mt-1">Edit details</div>
          </button>

          <button className="bg-red-600 hover:bg-red-500 transition rounded-2xl p-6 text-left">
            <div className="text-2xl mb-2">📡</div>
            <div className="font-bold text-white">SOS</div>
            <div className="text-red-100 text-sm mt-1">Emergency alert</div>
          </button>

        </div>
      </div>

      {/* incoming request popup — shows automatically via socket */}
      <IncomingRequest />
    </div>
  );
};

export default Dashboard;