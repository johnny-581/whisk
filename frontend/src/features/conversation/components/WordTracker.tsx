import { Button } from "@/components/ui/button";

interface Word {
  word: string;
  active: boolean;
}

interface WordTrackerProps {
  words: Word[];
}

export const WordTracker = ({ words }: WordTrackerProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 p-4 bg-black-900">
      {words.map(({ word, active }) => (
        <Button
          key={word}
          variant="outline"
          size="sm"
          disabled
          className={`${
            active
              ? "bg-white-900 text-white border-slate-700"
              : "bg-white-200/50 text-slate-500 line-through border-slate-800"
          }`}
        >
          {word}
        </Button>
      ))}
    </div>
  );
};
