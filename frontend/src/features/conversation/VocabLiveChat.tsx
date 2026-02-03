"use client";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import {
  ThemeProvider,
  ErrorCard,
  FullScreenContainer,
  PipecatAppBase,
  SpinLoader,
} from "@pipecat-ai/voice-ui-kit";

import { VocabLiveChatContent } from "./components/VocabLiveChatContent";
import { DEFAULT_TRANSPORT, TRANSPORT_CONFIG } from "./config";

// Main Feature Component with Providers
interface VocabLiveChatProps {
  conversationId?: string;
}

export const VocabLiveChat = ({ conversationId }: VocabLiveChatProps = {}) => {
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
              <VocabLiveChatContent
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
};
