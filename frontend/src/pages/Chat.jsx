import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { useSocket }                   from "../context/SocketContext";
import useAuth                         from "../hooks/useAuth";
import api                             from "../services/api";

const Chat = () => {
  const { requestId }  = useParams();
  const { socket }     = useSocket();
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const bottomRef      = useRef(null);

  const [messages,   setMessages  ] = useState([]);
  const [text,       setText      ] = useState("");
  const [typing,     setTyping    ] = useState(false);
  const [isTyping,   setIsTyping  ] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [loading,    setLoading   ] = useState(true);
  const typingTimeout = useRef(null);

  // fetch messages + get receiverId
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${requestId}`);
        setMessages(res.data);

        // mark as seen
        await api.patch(`/chat/${requestId}/seen`);

        // figure out who to send to
        // receiverId = the other person in the chat
        if (res.data.length > 0) {
          const first = res.data[0];
          const otherId = first.senderId._id === user._id
            ? first.receiverId._id || first.receiverId
            : first.senderId._id   || first.senderId;
          setReceiverId(otherId);
        }

        // also get from request
        const reqRes = await api.get(`/requests/${requestId}`);
        const reqData = reqRes.data;
        const other = reqData.userId?._id === user._id || reqData.userId === user._id
          ? reqData.helperId?._id || reqData.helperId
          : reqData.userId?._id   || reqData.userId;
        setReceiverId(other);

      } catch (err) {
        console.error("Fetch messages error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [requestId, user._id]);

  // join chat room + socket events
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", { requestId });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      // mark seen if I'm receiver
      if (msg.receiverId === user._id || msg.receiverId?._id === user._id) {
        socket.emit("mark_seen", { requestId });
        api.patch(`/chat/${requestId}/seen`);
      }
    });

    socket.on("user_typing",      () => setIsTyping(true));
    socket.on("user_stop_typing", () => setIsTyping(false));
    socket.on("messages_seen",    () => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, seen: true }))
      );
    });

    return () => {
      socket.emit("leave_chat", { requestId });
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      socket.off("messages_seen");
    };
  }, [socket, requestId, user._id]);

  // auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!text.trim() || !receiverId) return;

    socket.emit("send_message", {
      requestId,
      senderId:   user._id,
      receiverId,
      message:    text.trim(),
    });

    // stop typing indicator
    socket.emit("stop_typing", { requestId });
    clearTimeout(typingTimeout.current);
    setTyping(false);
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { requestId, senderName: user.name });
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(false);
      socket.emit("stop_typing", { requestId });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMine = (msg) =>
    msg.senderId?._id === user._id || msg.senderId === user._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-orange-500 animate-pulse font-bold">
          Loading chat...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <button
          onClick={() => navigate(`/track/${requestId}`)}
          className="text-gray-400 hover:text-white transition text-xl"
        >
          ←
        </button>
        <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center font-bold">
          🛣️
        </div>
        <div>
          <p className="font-bold text-sm">Request Chat</p>
          <p className="text-gray-400 text-xs">
            {isTyping ? (
              <span className="text-green-400">typing...</span>
            ) : (
              `#${requestId.slice(-6).toUpperCase()}`
            )}
          </p>
        </div>
        <button
          onClick={() => navigate(`/track/${requestId}`)}
          className="ml-auto text-orange-400 text-xs hover:text-orange-300 transition"
        >
          📍 Track
        </button>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-sm mt-10">
            No messages yet. Say hi! 👋
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`flex ${isMine(msg) ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-xs lg:max-w-md ${isMine(msg) ? "items-end" : "items-start"} flex flex-col gap-1`}>

              {/* bubble */}
              <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                isMine(msg)
                  ? "bg-orange-500 text-white rounded-br-sm"
                  : "bg-gray-800 text-white rounded-bl-sm"
              }`}>
                {msg.message}
              </div>

              {/* time + seen */}
              <div className={`flex items-center gap-1 text-xs text-gray-600 ${isMine(msg) ? "flex-row-reverse" : ""}`}>
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour:   "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMine(msg) && (
                  <span className={msg.seen ? "text-blue-400" : "text-gray-600"}>
                    {msg.seen ? "✓✓" : "✓"}
                  </span>
                )}
              </div>

            </div>
          </div>
        ))}

        {/* typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="px-4 py-4 bg-gray-900 border-t border-gray-800 sticky bottom-0">
        <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 py-2"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-9 h-9 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition"
          >
            <span className="text-white text-sm">➤</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Chat;