interface Word {
  id?: string;
  word: string;
  active: boolean;
}

interface VocabTrackerProps {
  words: Word[];
}

export const VocabTracker = ({ words }: VocabTrackerProps) => {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
      <div className="text-3xl font-bold text-slate-900">Vocabs</div>
      <div className="mt-6 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-2">
        {words.map(({ id, word, active }) => {
          const muted = !active;
          return (
            <div
              key={id ?? word}
              className={`flex items-center gap-3 text-2xl ${
                muted ? "text-slate-400" : "text-slate-900"
              }`}
            >
              <span
                className={`text-xl ${
                  muted ? "text-slate-300" : "text-emerald-700"
                }`}
              >
                ✓
              </span>
              <span className={muted ? "line-through" : ""}>{word}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
