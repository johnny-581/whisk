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
import conversationBg from "@/assets/conversation-bg.png";
import { DEFAULT_TRANSPORT, TRANSPORT_CONFIG } from "./config";
import type { VocabLiveChatProps, VocabWord } from "./types";
import { useVocabData, useWordTracking, useConversationState } from "./hooks";

/**
 * Main VocabLiveChat component
 * Manages conversation setup, UI, and provides Pipecat client context
 */
export const VocabLiveChat = ({ conversationId }: VocabLiveChatProps = {}) => {
  const videoId = conversationId ?? "default";

  // Fetch vocabulary data and user level
  const { words, error: vocabError, userLevel } = useVocabData({ videoId });

  // Build connection parameters
  const [connectParams, setConnectParams] = useState<APIRequest>(
    TRANSPORT_CONFIG[DEFAULT_TRANSPORT]
  );

  useEffect(() => {
    const baseConfig = TRANSPORT_CONFIG[DEFAULT_TRANSPORT];
    const baseRequestData =
      (baseConfig.requestData as Record<string, unknown> | undefined) ?? {};

    setConnectParams({
      ...baseConfig,
      requestData: {
        ...baseRequestData,
        videoId,
        userLevel,
        vocab: words.map(({ id, word, difficulty, start_time }: VocabWord) => ({
          id: id ?? null,
          word,
          difficulty: difficulty ?? null,
          start_time: start_time ?? null,
        })),
      },
    });
  }, [words, userLevel, videoId]);

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
                initialWords={words}
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
  initialWords: VocabWord[];
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          alt="Conversation background"
          fill
          priority
          className="bg-[#0f1f1a] object-contain"
          src={conversationBg}
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full gap-10 px-10 py-10">
        <aside className="w-[320px] shrink-0 pt-20">
          <VocabTracker words={words} />
        </aside>

        <section className="relative flex flex-1 items-stretch">
          <div className="absolute right-8 top-16 w-full max-w-[520px]">
            <AgentSpeechBubble />
          </div>

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/90 px-6 py-3 shadow-xl backdrop-blur">
            <UserAudioControl size="lg" />
            <ConnectionButton
              isConnected={isConnected}
              isConnecting={isConnecting}
              onClick={handleButtonClick}
            />
          </div>
        </section>
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
