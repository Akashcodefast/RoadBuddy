import { useParams, useNavigate }  from "react-router-dom";
import { useEffect, useState }     from "react";
import { useSocket }               from "../context/SocketContext";
import useLiveLocation             from "../hooks/useLiveLocation";
import MapView                     from "../components/MapView";
import notificationService         from "../services/notification.service";
import useAuth                     from "../hooks/useAuth";
import api                         from "../services/api";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LiveTracking = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { socket } = useSocket();
  const { user }   = useAuth();
  const userCoords = useLiveLocation();

  const [request,        setRequest       ] = useState(null);
  const [helper,         setHelper        ] = useState(null);
  const [requester,      setRequester     ] = useState(null);
  const [helperLocation, setHelperLocation] = useState(null);
  const [status,         setStatus        ] = useState("pending");
  const [loading,        setLoading       ] = useState(true);
  const [mapsLoaded,     setMapsLoaded    ] = useState(false);
  const [isHelper,       setIsHelper      ] = useState(false); // ← key flag

  // load Google Maps script
  useEffect(() => {
    if (!MAPS_KEY) { setMapsLoaded(false); return; }
    if (window.google) { setMapsLoaded(true); return; }

    const script   = document.createElement("script");
    script.src     = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    script.async   = true;
    script.onload  = () => setMapsLoaded(true);
    script.onerror = () => setMapsLoaded(false);
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  // fetch request + figure out role
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await api.get(`/requests/${id}`);
        const data = res.data;

        setRequest(data);
        setStatus(data.status);

        // am I the helper or the requester?
        const iAmHelper = data.helperId?._id === user._id ||
                          data.helperId      === user._id;
        setIsHelper(iAmHelper);

        if (data.helperId)  setHelper(data.helperId);
        if (data.userId)    setRequester(data.userId);

      } catch (err) {
        console.error("Fetch request error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id, user._id]);

  // socket listeners
  useEffect(() => {
    if (!socket) return;

    // requester hears this when helper accepts
    notificationService.onRequestAccepted(socket, (data) => {
      setStatus("accepted");
      setHelper({
        name:   data.helperName,
        phone:  data.helperPhone,
        rating: data.helperRating,
        _id:    data.helperId,
      });
    });

    // requester sees helper moving on map
    notificationService.onHelperLocation(socket, ({ lat, lng }) => {
      setHelperLocation({ lat, lng });
    });

    notificationService.onRequestCompleted(socket, () => {
      setStatus("completed");
    });

    return () => notificationService.cleanup(socket);
  }, [socket]);

  // helper marks complete
  const handleComplete = () => {
    socket.emit("complete_request", {
      requestId: id,
      helperId:  user._id,
    });
    setStatus("completed");
  };

  const handleCancel = async () => {
    try {
      await api.patch(`/requests/${id}/cancel`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Cancel error:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 font-bold text-lg animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-lg mx-auto">

        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg">
            🛣️
          </div>
          <div>
            <h1 className="text-lg font-bold">
              {isHelper ? "Helping Someone" : "Live Tracking"}
            </h1>
            <p className="text-gray-400 text-xs">
              Request #{id.slice(-6).toUpperCase()} ·{" "}
              <span className={isHelper ? "text-green-400" : "text-orange-400"}>
                {isHelper ? "You are the helper" : "You requested help"}
              </span>
            </p>
          </div>
        </div>

        {/* status banner */}
        <div className={`rounded-2xl p-4 mb-5 flex items-center gap-3 ${
          status === "pending"   ? "bg-yellow-500/10 border border-yellow-500/30" :
          status === "accepted"  ? "bg-green-500/10  border border-green-500/30"  :
          status === "completed" ? "bg-blue-500/10   border border-blue-500/30"   :
                                   "bg-gray-800      border border-gray-700"
        }`}>
          <span className="text-2xl">
            {status === "pending"   ? "⏳" :
             status === "accepted"  ? "🚗" :
             status === "completed" ? "✅" : "❌"}
          </span>
          <div className="flex-1">
            <p className={`font-bold ${
              status === "pending"   ? "text-yellow-400" :
              status === "accepted"  ? "text-green-400"  :
              status === "completed" ? "text-blue-400"   : "text-gray-400"
            }`}>
              {isHelper
                ? status === "accepted"  ? "Navigate to the user"
                : status === "completed" ? "Help provided! ✅"
                : "Request assigned to you"
                : status === "pending"   ? "Waiting for help..."
                : status === "accepted"  ? "Helper is on the way!"
                : status === "completed" ? "Request completed! 🎉"
                : "Cancelled"
              }
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {isHelper
                ? status === "accepted" ? "Drive safely to their location"
                : ""
                : status === "pending"  ? "Top 10 nearby users notified"
                : status === "accepted" ? "Track your helper on the map"
                : ""
              }
            </p>
          </div>
          {status === "pending" && !isHelper && (
            <span className="relative flex h-3 w-3 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400" />
            </span>
          )}
        </div>

        {/* MAP */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl mb-5 overflow-hidden"
             style={{ height: "260px" }}>
          {mapsLoaded ? (
            <MapView
              userLocation={userCoords}
              helperLocation={helperLocation}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 relative">
              <div className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, #1a1f2e, #151b27)",
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-2 animate-bounce">📍</div>
                {userCoords && (
                  <p className="text-gray-400 text-xs">
                    {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-1">
                  Add VITE_GOOGLE_MAPS_API_KEY to enable map
                </p>
              </div>
            </div>
          )}
        </div>

        {/* issue card */}
        {request && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
            <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">
              Issue
            </p>
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {request.issueType === "Fuel"      ? "⛽" :
                 request.issueType === "Tyre"      ? "🔩" :
                 request.issueType === "Battery"   ? "🔋" :
                 request.issueType === "Breakdown" ? "🔧" : "🆘"}
              </div>
              <div>
                <p className="font-bold text-lg">{request.issueType}</p>
                {request.description && (
                  <p className="text-gray-400 text-sm mt-1">
                    "{request.description}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REQUESTER VIEW — show helper details */}
        {!isHelper && helper && status === "accepted" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-4">
            <p className="text-green-400 text-xs mb-3 uppercase tracking-wider">
              Your Helper
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-xl font-bold text-green-400">
                {helper.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{helper.name}</p>
                <p className="text-gray-400 text-sm">
                  ⭐ {helper.rating || "New"} · On the way
                </p>
              </div>
              
              <a>
                📞 Call
              </a>
            </div>
          </div>
        )}

        {/* HELPER VIEW — show requester details + complete button */}
        {isHelper && requester && status === "accepted" && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 mb-4">
            <p className="text-orange-400 text-xs mb-3 uppercase tracking-wider">
              Person Needing Help
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-xl font-bold text-orange-400">
                {requester.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{requester.name}</p>
                <p className="text-gray-400 text-sm">
                  📍 {request?.issueType} issue
                </p>
              </div>
              
              <a>
                📞 Call
              </a>
            </div>

            {/* mark complete button */}
            <button
              onClick={handleComplete}
              className="w-full mt-4 bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl transition"
            >
              ✅ Mark as Completed
            </button>
          </div>
        )}

        {/* completed */}
        {status === "completed" && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 mb-4 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-blue-400 text-lg">
              {isHelper ? "Thank you for helping!" : "Help Received!"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {isHelper ? "You made someone's day better 🙌" : "Please rate your helper"}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* cancel — only requester, only pending */}
        {!isHelper && status === "pending" && (
          <button
            onClick={handleCancel}
            className="w-full bg-gray-900 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 font-semibold py-3 rounded-xl transition mt-2"
          >
            Cancel Request
          </button>
        )}

      </div>
    </div>
  );
};

export default LiveTracking;