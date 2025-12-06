export default function MessageInput({ value, setValue, send }) {
  return (
    <div className="flex p-3 gap-3 border-t bg-white">
      <input
        className="flex-1 bg-gray-100 p-3 rounded-xl outline-none text-sm"
        placeholder="Ask anything about legal rights..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button
        onClick={send}
        className="px-4 py-2 bg-blue-600 rounded-xl text-white shadow"
      >
        Send
      </button>
    </div>
  );
}
