export default function Typing() {
  return (
    <div className="px-3 py-2 bg-white rounded-xl border shadow-sm w-fit">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
}
