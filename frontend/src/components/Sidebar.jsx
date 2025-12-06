import { motion } from "framer-motion";

export default function Sidebar({ card }) {
  if (!card) return null;

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 h-full bg-white border-l p-4 overflow-y-auto"
    >
      <h2 className="text-lg font-semibold">{card.title}</h2>
      <p className="text-sm text-gray-700 mt-2">{card.summary}</p>

      <h3 className="font-medium mt-4 mb-1">Steps</h3>
      <ul className="list-disc ml-5 text-sm">
        {card.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      {card.languages?.mr && (
        <>
          <h3 className="font-medium mt-4">Marathi Summary</h3>
          <p className="text-sm text-gray-700">{card.languages.mr.summary}</p>
        </>
      )}

      <p className="text-xs mt-4 text-gray-400">Source: {card.id}</p>
    </motion.div>
  );
}
