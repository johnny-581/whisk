interface WordCardProps {
  word: string;
  start_time: string;
}

export function WordCard({ word, start_time }: WordCardProps) {
  return (
    <div className="p-2 border rounded">
      <p className="font-medium">{word}</p>
      <p className="text-sm text-muted-foreground">
        {start_time}
      </p>
    </div>
  );
}