const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",  // ← CHANGED THIS
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `You are RoadBuddy AI Assistant. Help with roadside emergencies, safety tips, driving advice. Keep answers short (2-3 sentences).`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(500).json({ message: data.error?.message || "API error" });
    }

    const botReply = data.choices[0]?.message?.content || "Sorry, couldn't respond.";

    res.json({
      success: true,
      userMessage: message,
      botReply: botReply,
    });

  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat };