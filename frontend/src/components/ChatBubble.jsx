import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function ChatBubble({ sender, text }) {
  const isUser = sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full my-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow text-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-900 border"
        }`}
      >
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
