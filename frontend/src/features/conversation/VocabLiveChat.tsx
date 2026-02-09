"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import type { APIRequest } from "@pipecat-ai/client-js";
import {
  ThemeProvider,
  ErrorCard,
  FullScreenContainer,
  PipecatAppBase,
  UserAudioControl,
} from "@pipecat-ai/voice-ui-kit";

import { AgentSpeechBubble } from "./components/AgentSpeechBubble";
import { ConnectionButton } from "./components/ConnectionButton";
import { ExitModal } from "./components/ExitModal";
import { VocabTracker } from "./components/WordTracker";
import { UserTranscriptBox } from "./components/UserTranscriptBox";
import liveChatBg from "@/assets/live-chat-bg.jpeg";
import { DEFAULT_TRANSPORT, TRANSPORT_CONFIG } from "./config";
import type { Vocab } from "./types";
import { useVocab, useWordTracking, useConversationState } from "./hooks";

// Props for main VocabLiveChat component
export interface VocabLiveChatProps {
  conversationId?: string;
}

/**
 * Main VocabLiveChat component
 * Manages conversation setup, UI, and provides Pipecat client context
 */
export const VocabLiveChat = ({ conversationId }: VocabLiveChatProps = {}) => {
  const videoId = conversationId!;

  // Loading state for initial page load
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vocabulary data and user level
  const { vocabs, summary, error: vocabError } = useVocab({ videoId });

  // Build connection parameters
  const [connectParams, setConnectParams] = useState<APIRequest>(
    TRANSPORT_CONFIG[DEFAULT_TRANSPORT]
  );

  // Show loading screen for 2 seconds on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const baseConfig = TRANSPORT_CONFIG[DEFAULT_TRANSPORT];
    const baseRequestData =
      (baseConfig.requestData as Record<string, unknown> | undefined) ?? {};

    setConnectParams({
      ...baseConfig,
      requestData: {
        ...baseRequestData,
        summary: summary,
        vocab: vocabs.map((word: Vocab) => ({
          id: word.id,
          japanese_vocab: word.japanese_vocab,
          pronunciation: word.pronunciation,
          english_translation: word.english_translation,
          timestamp: word.timestamp,
          jlpt_level: word.jlpt_level,
        })),
      },
    });
  }, [vocabs, summary]);

  return (
    <ThemeProvider defaultTheme="terminal" disableStorage>
      <FullScreenContainer>
        <PipecatAppBase
          connectParams={connectParams}
          transportType={DEFAULT_TRANSPORT}
        >
          {({
            client,
            handleConnect,
            handleDisconnect,
            error,
          }: PipecatBaseChildProps) =>
            !client ? (
              <div className="flex min-h-screen w-full items-center justify-center bg-[#0f1f1a] text-white/80">
                <p>Preparing conversation...</p>
              </div>
            ) : error ? (
              <ErrorCard>{error}</ErrorCard>
            ) : (
              <VocabLiveChatContent
                client={client}
                handleConnect={handleConnect}
                handleDisconnect={handleDisconnect}
                initialWords={vocabs}
                videoId={videoId}
              />
            )
          }
        </PipecatAppBase>
        {vocabError && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm">
            {vocabError}
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-mint-50/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <p className="text-neutral-800 text-2xl font-bold">
                Hold on tight while we prepare your conversation...
              </p>
            </div>
          </div>
        )}
      </FullScreenContainer>
    </ThemeProvider>
  );
};

/**
 * Internal conversation UI component
 * Handles word tracking, connection state, and user interactions
 */
const VocabLiveChatContent = ({
  client,
  handleConnect,
  handleDisconnect,
  initialWords,
  videoId,
}: {
  client: PipecatBaseChildProps["client"];
  handleConnect: PipecatBaseChildProps["handleConnect"];
  handleDisconnect: PipecatBaseChildProps["handleDisconnect"];
  initialWords: Vocab[];
  videoId: string;
}) => {
  // Track word completion state
  const { words, allCompleted } = useWordTracking({ initialWords });

  // Manage connection and navigation state
  const {
    isConnected,
    isConnecting,
    showExitModal,
    handleButtonClick,
    handleKeepPracticing,
    handleEndConversation,
  } = useConversationState({
    client,
    handleConnect,
    handleDisconnect,
    videoId,
    allWordsCompleted: allCompleted,
  });

  // Auto-connect when component mounts and vocabs are loaded
  useEffect(() => {
    if (
      initialWords.length > 0 &&
      !isConnected &&
      !isConnecting &&
      handleConnect
    ) {
      const timer = setTimeout(() => {
        console.log("Auto-connecting with vocabs:", initialWords.length);
        handleButtonClick();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    initialWords,
    isConnected,
    isConnecting,
    handleConnect,
    handleButtonClick,
  ]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image - fills entire page while preserving aspect ratio */}
      <div className="absolute inset-0">
        <Image
          alt="Live chat background"
          fill
          priority
          className="object-cover object-bottom"
          src={liveChatBg}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* Word tracker - left side, slightly toward bottom */}
        <aside className="absolute bottom-50 left-20">
          <VocabTracker words={words} />
        </aside>

        {/* Connect button - top right */}
        {/* <div className="absolute left-8 top-8">
          <ConnectionButton
            isConnected={isConnected}
            isConnecting={isConnecting}
            onClick={handleButtonClick}
          />
        </div> */}

        {/* Agent speech bubble */}
        <div className="absolute top-30 left-2/3 translate-x-[-10%]">
          <div className="w-[500px]">
            <AgentSpeechBubble />
          </div>
        </div>

        {/* User transcript box - bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-[600px]">
            <UserTranscriptBox />
          </div>
        </div>
      </div>

      {showExitModal && (
        <ExitModal
          onKeepPracticing={handleKeepPracticing}
          onEndConversation={handleEndConversation}
        />
      )}
    </div>
  );
};
