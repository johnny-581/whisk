import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

interface BotTranscriptData {
  text: string;
  timestamp?: string;
}

interface AgentSpeechBubbleProps {
  className?: string;
}

export const AgentSpeechBubble = ({ className }: AgentSpeechBubbleProps) => {
  const [botLines, setBotLines] = useState<string[]>([]);
  const startNewRef = useRef(false);

  const handleBotTranscript = useCallback((data: BotTranscriptData) => {
    if (!data.text) return;
    setBotLines((prev) => {
      if (prev.length === 0 || startNewRef.current) {
        startNewRef.current = false;
        return [...prev, data.text].slice(-6);
      }
      const updated = [...prev];
      updated[updated.length - 1] = `${updated[updated.length - 1]} ${
        data.text
      }`.trim();
      return updated.slice(-6);
    });
  }, []);

  const handleBotStopped = useCallback(() => {
    startNewRef.current = true;
  }, []);

  useRTVIClientEvent(RTVIEvent.BotTranscript, handleBotTranscript);
  useRTVIClientEvent(RTVIEvent.BotStoppedSpeaking, handleBotStopped);

  useEffect(() => {
    if (botLines.length > 8) {
      setBotLines((prev) => prev.slice(-6));
    }
  }, [botLines.length]);

  const currentMessage = useMemo(() => {
    if (botLines.length === 0) {
      return null;
    }
    return botLines[botLines.length - 1];
  }, [botLines]);

  if (!currentMessage) {
    return null;
  }

  return (
    <div className={className}>
      <div className="relative">
        {/* Triangle pointer */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="66"
          height="33"
          viewBox="0 0 66 33"
          fill="none"
          className="absolute -left-12 top-6"
        >
          <path d="M0 33L66 0V22.6567L0 33Z" fill="white" />
        </svg>

        <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-lg backdrop-blur-sm">
          <p className="text-xl leading-relaxed text-slate-800">
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
};
