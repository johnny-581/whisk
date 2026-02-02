"use client";

import { ThemeProvider } from "@pipecat-ai/voice-ui-kit";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import {
  ErrorCard,
  FullScreenContainer,
  PipecatAppBase,
  SpinLoader,
} from "@pipecat-ai/voice-ui-kit";

import { VocabLiveChat } from "../../features/vocab-live-chat/VocabLiveChat";
import { DEFAULT_TRANSPORT, TRANSPORT_CONFIG } from "../../config";

export default function Home() {
  const connectParams = TRANSPORT_CONFIG[DEFAULT_TRANSPORT];

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
              <SpinLoader />
            ) : error ? (
              <ErrorCard>{error}</ErrorCard>
            ) : (
              <VocabLiveChat
                client={client}
                handleConnect={handleConnect}
                handleDisconnect={handleDisconnect}
              />
            )
          }
        </PipecatAppBase>
      </FullScreenContainer>
    </ThemeProvider>
  );
}
