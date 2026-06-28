import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useLiveLocation from "../hooks/useLiveLocation";
import IncomingRequest from "../components/IncomingRequest";
import SOSButton from "../components/SOSButton";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const coords = useLiveLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-2xl mx-auto">

        {/* navbar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center text-lg sm:text-2xl">
              🛣️
            </div>
            <div>
              <span className="text-base sm:text-lg lg:text-2xl font-bold">RoadBuddy</span>
              <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Community Roadside Help</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-xs sm:text-sm transition font-medium"
          >
            Logout
          </button>
        </div>

        {/* welcome card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 mb-5 sm:mb-7 lg:mb-8">
          <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Welcome back 👋</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs sm:text-sm lg:text-base">
              Online — visible to nearby users
            </span>
          </div>
          {coords && (
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base mt-3">
              📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* stats row — hidden on mobile, visible on tablet+ */}
        <div className="hidden sm:grid grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center">
            <p className="text-yellow-400 font-bold text-lg lg:text-xl">⭐ {user?.rating || "New"}</p>
            <p className="text-gray-400 text-xs lg:text-sm mt-1">Rating</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center">
            <p className="text-green-400 font-bold text-lg lg:text-xl">💚 0</p>
            <p className="text-gray-400 text-xs lg:text-sm mt-1">Helped</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center">
            <p className="text-orange-400 font-bold text-lg lg:text-xl">📍 0</p>
            <p className="text-gray-400 text-xs lg:text-sm mt-1">Requests</p>
          </div>
        </div>

        {/* action cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">

          <button
            onClick={() => navigate("/request")}
            className="bg-orange-500 hover:bg-orange-400 active:scale-95 transition rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-6 text-center lg:text-left"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2 lg:mb-3">🆘</div>
            <div className="font-bold text-xs sm:text-sm lg:text-base">Request Help</div>
            <div className="text-orange-100 text-xs hidden sm:block lg:text-sm mt-1">Get assistance</div>
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500 transition rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-6 text-center lg:text-left"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2 lg:mb-3">📋</div>
            <div className="font-bold text-xs sm:text-sm lg:text-base">History</div>
            <div className="text-gray-400 text-xs hidden sm:block lg:text-sm mt-1">View requests</div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="bg-gray-900 border border-gray-800 hover:border-orange-500 transition rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-6 text-center lg:text-left"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2 lg:mb-3">👤</div>
            <div className="font-bold text-xs sm:text-sm lg:text-base">Profile</div>
            <div className="text-gray-400 text-xs hidden sm:block lg:text-sm mt-1">Edit details</div>
          </button>

          <button
            onClick={() => navigate("/chatbot")}
            className="bg-gray-900 border border-gray-800 hover:border-purple-500 transition rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-6 text-center lg:text-left"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl mb-1 sm:mb-2 lg:mb-3">🤖</div>
            <div className="font-bold text-xs sm:text-sm lg:text-base">AI Chat</div>
            <div className="text-gray-400 text-xs hidden sm:block lg:text-sm mt-1">Ask anything</div>
          </button>

        </div>

        {/* SOS button — full width on mobile, half on desktop */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <SOSButton />
        </div>

      </div>

      {/* incoming request popup */}
      <IncomingRequest />
    </div>
  );
};

export default Dashboard;