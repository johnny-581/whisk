"use client";

import { useEffect, useState, useCallback } from "react";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import { UserAudioControl } from "@pipecat-ai/voice-ui-kit";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

import { CustomConversationPanel } from "./CustomConversationPanel";
import { ConnectionButton } from "./ConnectionButton";
import { WordTracker } from "./WordTracker";

// Constants
const TARGET_WORDS: string[] = [
  "apple",
  "banana",
  "cherry",
  "date",
  "elderberry",
];

// Types
interface ServerMessage {
  type: string;
  payload?: string;
}

interface Word {
  word: string;
  active: boolean;
}

// Content Component (separated for cleaner logic)
export const VocabLiveChatContent = ({
  client,
  handleConnect,
  handleDisconnect,
}: PipecatBaseChildProps) => {
  // State Management
  const [words, setWords] = useState<Word[]>(
    TARGET_WORDS.map((w) => ({ word: w, active: true }))
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize devices on mount
  useEffect(() => {
    client?.initDevices();
  }, [client]);

  // Event Handlers
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

  const handleButtonClick = useCallback(() => {
    if (isConnected) {
      handleDisconnect?.();
    } else {
      setIsConnecting(true);
      handleConnect?.();
    }
  }, [isConnected, handleConnect, handleDisconnect]);

  // RTVI Event Subscriptions
  useRTVIClientEvent(RTVIEvent.ServerMessage, handleMessage);

  useRTVIClientEvent(RTVIEvent.Connected, () => {
    setIsConnected(true);
    setIsConnecting(false);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, () => {
    setIsConnected(false);
    setIsConnecting(false);
  });

  // Render
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Controls */}
      <header className="flex items-center justify-between gap-4 p-4">
        <div /> {/* Spacer for layout balance */}
        <div className="flex items-center gap-4">
          <UserAudioControl size="lg" />
          <ConnectionButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            onClick={handleButtonClick}
          />
        </div>
      </header>

      {/* Word Tracker / Scoreboard */}
      <WordTracker words={words} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden px-4 py-4 flex gap-4">
        <div className="flex-1 overflow-hidden">
          <CustomConversationPanel />
        </div>
      </main>
    </div>
  );
};
