import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import type { RTVIClient } from "@pipecat-ai/client-js";

interface UseConversationStateParams {
  client: RTVIClient | null;
  handleConnect?: () => void;
  handleDisconnect?: () => void;
  videoId: string;
  allWordsCompleted: boolean;
}

interface UseConversationStateReturn {
  isConnected: boolean;
  isConnecting: boolean;
  showExitModal: boolean;
  setShowExitModal: (show: boolean) => void;
  handleButtonClick: () => void;
  handleKeepPracticing: () => void;
  handleEndConversation: () => void;
}

/**
 * Hook to manage conversation connection state and navigation
 */
export const useConversationState = ({
  client,
  handleConnect,
  handleDisconnect,
  videoId,
  allWordsCompleted,
}: UseConversationStateParams): UseConversationStateReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingExit, setPendingExit] = useState(false);
  const router = useRouter();

  // Initialize devices on mount
  useEffect(() => {
    client?.initDevices();
  }, [client]);

  // Handle Escape key to show exit modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowExitModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle all words completed
  useEffect(() => {
    if (allWordsCompleted) {
      setPendingExit(true);
    }
  }, [allWordsCompleted]);

  // Connection button handler
  const handleButtonClick = useCallback(() => {
    if (isConnected) {
      handleDisconnect?.();
    } else {
      setIsConnecting(true);
      handleConnect?.();
    }
  }, [isConnected, handleConnect, handleDisconnect]);

  // Exit modal handlers
  const handleKeepPracticing = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const handleEndConversation = useCallback(() => {
    setShowExitModal(false);
    handleDisconnect?.();
    router.replace(`/videos/${videoId}`);
  }, [handleDisconnect, router, videoId]);

  // RTVI Event Subscriptions
  useRTVIClientEvent(RTVIEvent.Connected, () => {
    setIsConnected(true);
    setIsConnecting(false);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, () => {
    setIsConnected(false);
    setIsConnecting(false);
  });

  useRTVIClientEvent(RTVIEvent.BotStoppedSpeaking, () => {
    if (!pendingExit) return;
    handleDisconnect?.();
    router.replace(`/videos/${videoId}`);
  });

  return {
    isConnected,
    isConnecting,
    showExitModal,
    setShowExitModal,
    handleButtonClick,
    handleKeepPracticing,
    handleEndConversation,
  };
};
