import { useCallback, useState } from "react";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

interface UserTranscriptData {
  text: string;
  timestamp?: string;
}

interface UserTranscriptBoxProps {
  className?: string;
}

export const UserTranscriptBox = ({ className }: UserTranscriptBoxProps) => {
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  const handleUserTranscript = useCallback((data: UserTranscriptData) => {
    if (!data.text) return;
    setCurrentTranscript(data.text);
  }, []);

  const handleUserStartedSpeaking = useCallback(() => {
    // Clear transcript at the start of each turn
    setCurrentTranscript("");
  }, []);

  // const handleBotStartedSpeaking = useCallback(() => {
  //   // Clear transcript when bot starts speaking (new turn)
  //   setCurrentTranscript("");
  // }, []);

  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript);
  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, handleUserStartedSpeaking);
  // useRTVIClientEvent(RTVIEvent.BotStartedSpeaking, handleBotStartedSpeaking);

  return (
    <div className={className}>
      <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-lg backdrop-blur-sm">
        <p className="text-xl leading-relaxed text-slate-800">
          {currentTranscript || ""}
        </p>
      </div>
    </div>
  );
};
