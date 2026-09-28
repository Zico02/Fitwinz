export type Gender = "women" | "men";

export default function GenderToggle({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  return (
    <div className="flex bg-gray-100 rounded-full p-1">
      {(["women", "men"] as const).map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            value === g ? "bg-black text-white" : "text-gray-600 hover:text-black"
          }`}
        >
          {g.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
