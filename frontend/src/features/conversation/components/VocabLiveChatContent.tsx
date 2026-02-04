"use client";

import { useEffect, useState, useCallback } from "react";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import { UserAudioControl } from "@pipecat-ai/voice-ui-kit";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

import { CustomConversationPanel } from "./CustomConversationPanel";
import { ConnectionButton } from "./ConnectionButton";
import { WordTracker } from "./WordTracker";

// Types
interface ServerMessage {
  type: string;
  payload?: string;
}

interface Word {
  word: string;
  active: boolean;
}

interface VocabLiveChatContentProps extends PipecatBaseChildProps {
  initialWords: string[];
}

// Content Component (separated for cleaner logic)
export const VocabLiveChatContent = ({
  client,
  handleConnect,
  handleDisconnect,
  initialWords,
}: VocabLiveChatContentProps) => {
  // State Management
  const [words, setWords] = useState<Word[]>(() =>
    initialWords.map((w) => ({ word: w, active: true }))
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize devices on mount
  useEffect(() => {
    client?.initDevices();
  }, [client]);

  useEffect(() => {
    setWords(initialWords.map((w) => ({ word: w, active: true })));
  }, [initialWords]);

  // Event Handlers
  const handleMessage = useCallback((message: ServerMessage) => {
    if (message.type === "word_detected" && message.payload) {
      const detectedWord = message.payload;
      setWords((prev: Word[]) =>
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
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 py-6">
        <aside className="w-60 shrink-0">
          <WordTracker words={words} />
        </aside>

        <section className="flex min-h-[70vh] flex-1 flex-col">
          <div className="flex justify-end">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-end gap-3">
                <UserAudioControl size="lg" />
                <ConnectionButton
                  isConnected={isConnected}
                  isConnecting={isConnecting}
                  onClick={handleButtonClick}
                />
              </div>
              <div className="mt-4 h-[320px] overflow-hidden">
                <CustomConversationPanel />
              </div>
            </div>
          </div>

          <div className="mt-auto flex w-full justify-center pt-6">
            <div className="flex h-12 w-full max-w-3xl items-center justify-center rounded-full border border-slate-200 bg-white/70 px-4 shadow-sm">
              <UserAudioControl size="lg" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
