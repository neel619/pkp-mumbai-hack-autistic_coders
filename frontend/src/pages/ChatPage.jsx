import { useState } from "react";
import axios from "axios";

import ChatBubble from "../components/ChatBubble";
import MessageInput from "../components/MessageInput";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Typing from "../components/Typing";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sideCard, setSideCard] = useState(null);

  const send = async () => {
    if (!msg.trim()) return;

    setMessages((m) => [...m, { sender: "user", text: msg }]);
    const q = msg;
    setMsg("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/agent", { q });
      setMessages((m) => [...m, { sender: "bot", text: res.data.answer }]);
      setSideCard(res.data.card);
    } catch {
      setMessages((m) => [...m, { sender: "bot", text: "Server error." }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Header />

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <ChatBubble key={i} sender={m.sender} text={m.text} />
          ))}
          {loading && <Typing />}
        </div>

        <MessageInput value={msg} setValue={setMsg} send={send} />
      </div>

      {/* Sidebar */}
      <Sidebar card={sideCard} />
    </div>
  );
}
