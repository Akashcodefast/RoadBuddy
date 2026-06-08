import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import useAuth from "./useAuth";

const useLiveLocation = () => {
  const { socket } = useSocket();
  const { user }   = useAuth();
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!user || !socket) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setCoords({ lat, lng });
          socket.emit("update_location", {
            userId: user._id,
            lat,
            lng,
          });
        },
        (err) => console.error("Location error:", err.message),
        { enableHighAccuracy: true }
      );
    };

    sendLocation();
    const interval = setInterval(sendLocation, 10000);
    return () => clearInterval(interval);
  }, [user, socket]);

  return coords;
};

export default useLiveLocation;