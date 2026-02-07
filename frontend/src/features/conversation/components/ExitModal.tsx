interface ExitModalProps {
  onKeepPracticing: () => void;
  onEndConversation: () => void;
}

export const ExitModal = ({
  onKeepPracticing,
  onEndConversation,
}: ExitModalProps) => {
  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/50" />
      <div className="absolute left-1/2 top-1/2 z-50 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-[#f7fcfa] p-10 shadow-2xl">
        <div className="flex flex-col gap-8 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-900">
              End the conversation early?
            </h2>
            <p className="text-lg text-slate-700">
              Conversation so far will be stored in history but cannot be
              continued.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onKeepPracticing}
              className="flex-1 rounded-lg border border-emerald-900 bg-white px-4 py-3 text-lg font-medium text-slate-900 transition-colors hover:bg-emerald-50"
            >
              Keep Practicing
            </button>
            <button
              type="button"
              onClick={onEndConversation}
              className="flex-1 rounded-lg bg-emerald-900 px-4 py-3 text-lg font-bold text-white transition-colors hover:bg-emerald-800"
            >
              End Conversation
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
