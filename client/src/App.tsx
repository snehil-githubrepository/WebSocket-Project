import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]); // Store chat messages
  const [currentMessage, setCurrentMessage] = useState<string>(""); // Typing area
  const chatWindowRef = useRef<HTMLDivElement>(null); // Reference for auto-scroll

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      console.log("Connected to the chat server.");
    };

    newSocket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data); // Parse incoming message
        console.log("Message received:", parsedData);
        setMessages((prevMessages) => [...prevMessages, parsedData.message]); // Append to messages
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    setSocket(newSocket);

    return () => newSocket.close(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Auto-scroll to the bottom when a new message is added
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim() !== "" && socket) {
      socket.send(JSON.stringify({ message: currentMessage })); // Send message to the server
      setCurrentMessage(""); // Clear input
    }
  };

  if (!socket) {
    return <div>Connecting to the chat server...</div>;
  }

  return (
    <div className="chat-app">
      <div ref={chatWindowRef} className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            {msg}
          </div>
        ))}
      </div>
      <div className="chat-controls">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
