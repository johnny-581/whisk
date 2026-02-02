import { useEffect, useState, useCallback } from "react";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import {
  ConnectButton,
  ConversationPanel,
  UserAudioControl,
} from "@pipecat-ai/voice-ui-kit";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

import targetWords from "@/data/target-words.json";

const TARGET_WORDS: string[] = targetWords;

interface ServerMessage {
  type: string;
  payload?: string;
}

export const App = ({
  client,
  handleConnect,
  handleDisconnect,
}: PipecatBaseChildProps) => {
  // State for words
  const [words, setWords] = useState(
    TARGET_WORDS.map((w) => ({ word: w, active: true })),
  );

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
            : w,
        ),
      );
    }
  }, []);

  useRTVIClientEvent(RTVIEvent.ServerMessage, handleMessage);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between gap-4 p-4">
        <div /> {/* Spacer */}
        <div className="flex items-center gap-4">
          <UserAudioControl size="lg" />
          <ConnectButton
            size="lg"
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>

      {/* Scoreboard / Word Tracker */}
      <div className="flex flex-wrap justify-center gap-3 p-4 bg-slate-50 border-b">
        {words.map(({ word, active }) => (
          <span
            key={word}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
              active
                ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                : "bg-slate-200 text-slate-400 decoration-slate-400 line-through"
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-hidden px-4 py-4 flex gap-4">
        <div className="flex-1 overflow-hidden">
          <ConversationPanel />
        </div>
      </div>
      {/* <div className="h-96 overflow-hidden px-4 pb-4">
        <EventsPanel />
      </div> */}
    </div>
  );
};
