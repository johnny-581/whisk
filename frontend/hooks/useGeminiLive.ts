"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PipecatClient } from "@pipecat-ai/client-js";
import {
  WebSocketTransport,
  ProtobufFrameSerializer,
} from "@pipecat-ai/websocket-transport";

export function useGeminiLive(backendUrl: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Is the bot speaking?
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<PipecatClient | null>(null);

  useEffect(() => {
    // Initialize the client with WebSocket Transport
    const transport = new WebSocketTransport({
      serializer: new ProtobufFrameSerializer(),
      recorderSampleRate: 16000,
      playerSampleRate: 16000,
    });

    const client = new PipecatClient({
      transport,
      enableMic: true,
      callbacks: {
        onConnected: () => setIsConnected(true),
        onDisconnected: () => setIsConnected(false),
        onTransportStateChanged: (state: string) => {
          console.log("Transport State:", state);
        },
        onBotConnected: () => console.log("Bot Connected"),
        onUserStartedSpeaking: () => setIsSpeaking(false),
        onBotStartedSpeaking: () => setIsSpeaking(true),
        onBotStoppedSpeaking: () => setIsSpeaking(false),
      },
    });

    clientRef.current = client;

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [backendUrl]);

  const connect = useCallback(async () => {
    if (!clientRef.current) return;
    try {
      setError(null);
      await clientRef.current.connect({ wsUrl: backendUrl });
      setIsMicEnabled(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
    }
  }, [backendUrl]);

  const disconnect = useCallback(async () => {
    if (!clientRef.current) return;
    await clientRef.current.disconnect();
    setIsMicEnabled(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (!clientRef.current) return;
    const newState = !isMicEnabled;
    clientRef.current.enableMic(newState);
    setIsMicEnabled(newState);
  }, [isMicEnabled]);

  return {
    isConnected,
    isSpeaking,
    isMicEnabled,
    error,
    connect,
    disconnect,
    toggleMic,
  };
}
