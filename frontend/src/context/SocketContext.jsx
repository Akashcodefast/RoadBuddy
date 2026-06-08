import { createContext, useEffect, useContext } from "react";
import socket from "../services/socket";
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
  if (!user) {
    socket.disconnect();
    return;
  }

  // small delay to make sure user._id is ready
  const timer = setTimeout(() => {
    socket.connect();
    socket.emit("user_online", user._id);
    console.log("Socket connected for user:", user._id);
  }, 300);

  return () => {
    clearTimeout(timer);
    socket.off("user_online");
  };
}, [user]);


  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);