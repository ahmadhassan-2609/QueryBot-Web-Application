import { useState, useEffect, useRef } from "react";

const ChatApp = () => {
  const [messages, setMessages] = useState<{ type: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatboxRef = useRef<HTMLDivElement>(null);

  const sendQuery = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { type: "user", text: input }];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: input }),
        });
        const data = await response.json();
        setMessages([...newMessages, { type: "bot", text: data.response }]);
      } catch (error) {
        setMessages([
          ...newMessages,
          {
            type: "bot",
            text: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chatbox" ref={chatboxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="message bot typing-indicator">
            <div className="bubble">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuery()}
          placeholder="Type your question here..."
        />
        <button onClick={sendQuery}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
