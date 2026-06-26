import { useState, useRef, useEffect } from "react";
import api                             from "../services/api";

const ChatbotWidget = () => {
  const [open,     setOpen    ] = useState(false);
  const [messages, setMessages] = useState([
    {
      id:   "welcome",
      type: "bot",
      text: "👋 Hi! I'm RoadBuddy AI. How can I help?",
    },
  ]);
  const [input,    setInput   ] = useState("");
  const [loading,  setLoading ] = useState(false);
  const bottomRef  = useRef(null);

  // auto scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text: userMsg },
    ]);

    setLoading(true);

    try {
      const res = await api.post("/chatbot/chat", { message: userMsg });

      setMessages((prev) => [
        ...prev,
        {
          id:   Date.now() + 1,
          type: "bot",
          text: res.data.botReply,
        },
      ]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id:   Date.now() + 1,
          type: "bot",
          text: "❌ Something went wrong. Try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-xl transition transform hover:scale-110 animate-bounce"
        >
          🤖
        </button>
      )}

      {/* chatbot window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="font-bold text-sm">RoadBuddy AI</p>
                <p className="text-purple-100 text-xs">Always here</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-purple-100 transition text-lg"
            >
              ✕
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-lg text-sm ${
                    msg.type === "user"
                      ? "bg-purple-500 text-white rounded-br-none"
                      : "bg-gray-800 text-white rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2.5 rounded-lg rounded-bl-none flex gap-1 items-center">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Ask me..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-7 h-7 bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-md flex items-center justify-center transition"
              >
                <span className="text-white text-xs">➤</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatbotWidget;