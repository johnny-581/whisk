interface Word {
  id?: string;
  word: string;
  active: boolean;
}

interface WordTrackerProps {
  words: Word[];
}

export const WordTracker = ({ words }: WordTrackerProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="text-base font-semibold text-slate-900">Vocabs</div>
      <div className="mt-4 flex flex-col gap-3">
        {words.map(({ id, word, active }) => (
          <label
            key={id ?? word}
            className="flex items-center gap-3 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!active}
              disabled
              readOnly
            />
            <span className={active ? "" : "line-through text-slate-400"}>
              {word}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
