import { useEffect, useRef, useState, useCallback } from "react";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

interface TranscriptEntry {
  role: "user" | "bot";
  text: string;
  timestamp: string;
}

interface UserTranscriptData {
  text: string;
  final: boolean;
  timestamp: string;
  user_id: string;
}

interface BotTranscriptData {
  text: string;
  timestamp?: string;
}

export const CustomConversationPanel = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen to user transcripts
  const handleUserTranscript = useCallback((data: UserTranscriptData) => {
    if (data.final && data.text) {
      setTranscript((prev) => [
        ...prev,
        {
          role: "user",
          text: data.text,
          timestamp: data.timestamp,
        },
      ]);
    }
  }, []);

  // Listen to bot transcripts
  const handleBotTranscript = useCallback((data: BotTranscriptData) => {
    if (data.text) {
      setTranscript((prev) => {
        // Check if the last message is from the bot
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.role === "bot") {
          // Append to the existing bot message
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastEntry,
            text: lastEntry.text + " " + data.text,
            timestamp: data.timestamp || lastEntry.timestamp,
          };
          return updated;
        } else {
          // Create a new bot message entry
          return [
            ...prev,
            {
              role: "bot",
              text: data.text,
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ];
        }
      });
    }
  }, []);

  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript);
  useRTVIClientEvent(RTVIEvent.BotTranscript, handleBotTranscript);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto flex flex-col gap-4 pb-4"
    >
      {transcript.map((entry, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {entry.role === "user" ? "You" : "Agent"}
          </div>
          <div className="text-white-900 whitespace-pre-wrap wrap-break-word">
            {entry.text}
          </div>
        </div>
      ))}
      {transcript.length === 0 && (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          Start a conversation to see the transcript
        </div>
      )}
    </div>
  );
};
