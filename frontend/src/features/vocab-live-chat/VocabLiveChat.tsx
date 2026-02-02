import { useEffect, useState, useCallback } from "react";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import { UserAudioControl } from "@pipecat-ai/voice-ui-kit";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import { CustomConversationPanel } from "./components/CustomConversationPanel";
import { ConnectionButton } from "./components/ConnectionButton";
import { WordTracker } from "./components/WordTracker";

const TARGET_WORDS: string[] = [
  "apple",
  "banana",
  "cherry",
  "date",
  "elderberry",
];

interface ServerMessage {
  type: string;
  payload?: string;
}

export const VocabLiveChat = ({
  client,
  handleConnect,
  handleDisconnect,
}: PipecatBaseChildProps) => {
  // State for words
  const [words, setWords] = useState(
    TARGET_WORDS.map((w) => ({ word: w, active: true }))
  );

  // Track connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    client?.initDevices();
  }, [client]);

  const handleMessage = useCallback((message: ServerMessage) => {
    if (message.type === "word_detected" && message.payload) {
      const detectedWord = message.payload;
      setWords((prev) =>
        prev.map((w) =>
          w.word.toLowerCase() === detectedWord.toLowerCase()
            ? { ...w, active: false }
            : w
        )
      );
    }
  }, []);

  useRTVIClientEvent(RTVIEvent.ServerMessage, handleMessage);

  useRTVIClientEvent(RTVIEvent.Connected, () => {
    setIsConnected(true);
    setIsConnecting(false);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, () => {
    setIsConnected(false);
    setIsConnecting(false);
  });

  const handleButtonClick = () => {
    if (isConnected) {
      handleDisconnect?.();
    } else {
      setIsConnecting(true);
      handleConnect?.();
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between gap-4 p-4">
        <div /> {/* Spacer */}
        <div className="flex items-center gap-4">
          <UserAudioControl size="lg" />
          <ConnectionButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            onClick={handleButtonClick}
          />
        </div>
      </div>

      {/* Scoreboard / Word Tracker */}
      <WordTracker words={words} />

      <div className="flex-1 overflow-hidden px-4 py-4 flex gap-4">
        <div className="flex-1 overflow-hidden">
          <CustomConversationPanel />
        </div>
      </div>
      {/* <div className="h-96 overflow-hidden px-4 pb-4">
        <EventsPanel />
      </div> */}
    </div>
  );
};
