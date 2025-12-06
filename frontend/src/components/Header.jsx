export default function Header() {
  return (
    <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        CivicGuard AI
      </h1>
      <span className="text-xs text-gray-500">AI Legal Assistant</span>
    </div>
  );
}
