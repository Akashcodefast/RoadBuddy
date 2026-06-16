import { useState } from "react";
import api          from "../services/api";
import { useSocket } from "../context/SocketContext";
import notificationService from "../services/notification.service";
import { useEffect } from "react";

const SOSButton = () => {
  const { socket } = useSocket();

  const [step,        setStep       ] = useState("idle");
  // idle | confirm | locating | sending | success | error
  const [notified,    setNotified   ] = useState(0);
  const [requestId,   setRequestId  ] = useState(null);
  const [sosAlert,    setSOSAlert   ] = useState(null); // incoming SOS from others
  const [errorMsg,    setErrorMsg   ] = useState("");

  // listen for SOS alerts from others
  useEffect(() => {
    if (!socket) return;

    notificationService.onSOSAlert(socket, (data) => {
      setSOSAlert(data);
    });

    return () => socket.off("sos_alert");
  }, [socket]);

  const handleSOSTap = () => {
    setStep("confirm"); // show confirmation first
  };

  const handleConfirm = () => {
    setStep("locating");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStep("sending");

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await api.post("/users/sos", {
            lat,
            lng,
            message: "🆘 SOS! I need immediate roadside help!",
          });

          setNotified(res.data.notified);
          setRequestId(res.data.requestId);
          setStep("success");

        } catch (err) {
          setErrorMsg(err.response?.data?.message || "SOS failed");
          setStep("error");
        }
      },
      (err) => {
        setErrorMsg("Location access denied. Enable GPS to send SOS.");
        setStep("error");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCancel = () => setStep("idle");
  const handleReset  = () => {
    setStep("idle");
    setSOSAlert(null);
  };

  return (
    <>
      {/* ── SOS BUTTON ── */}
      {step === "idle" && (
        <button
          onClick={handleSOSTap}
          className="w-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3 text-lg shadow-lg shadow-red-900/40"
        >
          <span className="text-2xl">🆘</span>
          SOS Emergency
        </button>
      )}

      {/* ── CONFIRM DIALOG ── */}
      {step === "confirm" && (
        <div className="bg-red-600/10 border border-red-500/40 rounded-2xl p-5">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🆘</div>
            <p className="font-bold text-red-400 text-lg">Send SOS Alert?</p>
            <p className="text-gray-400 text-sm mt-1">
              Your live location will be sent to top 10 nearby users instantly.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition"
            >
              Yes, Send SOS
            </button>
          </div>
        </div>
      )}

      {/* ── LOCATING ── */}
      {step === "locating" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2 animate-pulse">📍</div>
          <p className="text-yellow-400 font-semibold">Getting your location...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      )}

      {/* ── SENDING ── */}
      {step === "sending" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2 animate-spin">📡</div>
          <p className="text-orange-400 font-semibold">Sending SOS alert...</p>
          <p className="text-gray-500 text-sm mt-1">Notifying nearby users</p>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {step === "success" && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-green-400 text-lg">SOS Sent!</p>
            <p className="text-gray-400 text-sm mt-1">
              <span className="text-white font-semibold">{notified}</span> nearby
              users have been alerted.
            </p>
            {notified === 0 && (
              <p className="text-yellow-400 text-xs mt-2">
                No users online nearby. Try again in a few minutes.
              </p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>
      )}

      {/* ── ERROR ── */}
      {step === "error" && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">❌</div>
            <p className="font-bold text-red-400 text-lg">SOS Failed</p>
            <p className="text-gray-400 text-sm mt-1">{errorMsg}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-800 text-gray-300 font-semibold py-3 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── INCOMING SOS ALERT FROM OTHERS ── */}
      {sosAlert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-gray-900 border border-red-500/50 rounded-2xl p-6 shadow-2xl">

            {/* flashing header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute" />
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-red-400 font-bold text-lg ml-4">
                🆘 SOS ALERT NEARBY!
              </span>
            </div>

            <div className="bg-red-500/10 rounded-xl p-4 mb-4">
              <p className="font-bold text-white text-lg">{sosAlert.senderName}</p>
              <p className="text-gray-400 text-sm mt-1">needs emergency help!</p>
              <p className="text-gray-500 text-xs mt-2">"{sosAlert.message}"</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSOSAlert(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl transition"
              >
                Dismiss
              </button>
              <a
                href={`tel:${sosAlert.senderPhone}`}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition text-center"
              >
                📞 Call Now
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;