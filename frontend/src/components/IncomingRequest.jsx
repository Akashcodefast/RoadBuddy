import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useSocket }           from "../context/SocketContext";
import useAuth                 from "../hooks/useAuth";

const IncomingRequest = () => {
  const { socket } = useSocket();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [request,  setRequest ] = useState(null);
  const [accepting,setAccepting] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("incoming_request", (data) => {
      console.log("Incoming request:", data);
      setRequest(data);
    });

    socket.on("request_closed", () => {
      setRequest(null);
    });

    return () => {
      socket.off("incoming_request");
      socket.off("request_closed");
    };
  }, [socket]);

  const handleAccept = async () => {
    if (!request) return;
    setAccepting(true);

    try {
      socket.emit("accept_request", {
        requestId: request.requestId,
        helperId:  user._id,
      });

      setRequest(null);

      // ✅ redirect helper to live tracking page
      navigate(`/track/${request.requestId}`);

    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => setRequest(null);

  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">

      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* popup card */}
      <div className="relative w-full max-w-md bg-gray-900 border border-orange-500/40 rounded-2xl p-6 shadow-2xl">

        {/* pulse indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping absolute" />
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
          <span className="text-orange-400 text-sm font-semibold ml-3">
            Someone needs help nearby!
          </span>
        </div>

        {/* request details */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-lg">{request.requesterName}</p>
              <p className="text-gray-400 text-sm">needs assistance</p>
            </div>
            <div className="text-3xl">
              {request.issueType === "Fuel"      ? "⛽" :
               request.issueType === "Tyre"      ? "🔩" :
               request.issueType === "Battery"   ? "🔋" :
               request.issueType === "Breakdown" ? "🔧" : "🆘"}
            </div>
          </div>

          <div className="flex gap-3">
            <span className="bg-orange-500/15 text-orange-400 text-xs px-3 py-1 rounded-full font-medium">
              {request.issueType}
            </span>
            <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
              📍 {request.distance < 1000
                ? `${request.distance}m away`
                : `${(request.distance / 1000).toFixed(1)}km away`}
            </span>
          </div>

          {request.description && (
            <p className="text-gray-400 text-sm mt-3">
              "{request.description}"
            </p>
          )}
        </div>

        {/* actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-2 w-2/3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            {accepting ? "Accepting..." : "✅ Accept & Help"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default IncomingRequest;