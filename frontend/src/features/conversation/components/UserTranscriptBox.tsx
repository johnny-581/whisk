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
  const [shouldClearOnNextSpeak, setShouldClearOnNextSpeak] =
    useState<boolean>(true);
  const [botHasStoppedOnce, setBotHasStoppedOnce] = useState<boolean>(false);

  const handleUserTranscript = useCallback((data: UserTranscriptData) => {
    if (!data.text) return;
    // The RTVI UserTranscript event provides chunks
    // so we append them to build the full transcript
    setCurrentTranscript((prev) => prev + " " + data.text);
  }, []);

  const handleUserStartedSpeaking = useCallback(() => {
    console.log("User started speaking");
    // Only clear transcript the first time user speaks after bot stopped speaking
    if (shouldClearOnNextSpeak) {
      setCurrentTranscript("");
      setShouldClearOnNextSpeak(false);
    }
  }, [shouldClearOnNextSpeak]);

  const handleBotStoppedSpeaking = useCallback(() => {
    console.log("Bot stopped speaking");
    // Set flag so transcript will be cleared on next user speech
    setShouldClearOnNextSpeak(true);
    // Mark that bot has stopped speaking at least once
    setBotHasStoppedOnce(true);
  }, []);

  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript);
  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, handleUserStartedSpeaking);
  useRTVIClientEvent(RTVIEvent.BotStoppedSpeaking, handleBotStoppedSpeaking);

  if (!botHasStoppedOnce) {
    return null;
  }

  return (
    <div className={className}>
      <div className="rounded-3xl bg-white/90 px-8 py-6 shadow-lg backdrop-blur-sm">
        <div className="text-xl leading-relaxed text-slate-800 text-center">
          {currentTranscript ? (
            <p className="">{currentTranscript}</p>
          ) : (
            <p className="text-neutral-800/50">You&apos;re up next!</p>
          )}
        </div>
      </div>
    </div>
  );
};
