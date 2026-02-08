import type { Vocab } from "../types";

interface VocabTrackerProps {
  words: Vocab[];
}

export const VocabTracker = ({ words }: VocabTrackerProps) => {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
      <div className="text-3xl font-bold text-slate-900">Vocabs</div>
      <div className="mt-6 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2">
        {words.map(({ id, japanese_vocab, checked }) => {
          return (
            <div
              key={id}
              className={`flex items-center gap-3 text-2xl ${
                checked ? "text-slate-400" : "text-slate-900"
              }`}
            >
              <span
                className={`text-xl ${
                  checked ? "text-slate-300" : "text-emerald-700"
                }`}
              >
                ✓
              </span>
              <span className={checked ? "line-through" : ""}>
                {japanese_vocab}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
