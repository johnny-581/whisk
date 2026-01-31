"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenAI, Modality, Session } from "@google/genai";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface AudioMessage {
  type: "user" | "assistant";
  status: "speaking" | "done";
}

export function useGeminiLive() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [volume, setVolume] = useState(0);

  // Debug logging helper
  const log = (category: string, message: string, data?: unknown) => {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] [useGeminiLive:${category}]`,
      message,
      data !== undefined ? data : "",
    );
  };

  const sessionRef = useRef<Session | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    log("Cleanup", "Starting cleanup process");

    if (animationFrameRef.current) {
      log("Cleanup", "Cancelling animation frame");
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (processorRef.current) {
      log("Cleanup", "Disconnecting audio processor");
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      log("Cleanup", "Disconnecting audio source");
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      log("Cleanup", "Disconnecting analyser");
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (mediaStreamRef.current) {
      log("Cleanup", "Stopping media stream tracks");
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      log("Cleanup", "Closing audio context");
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (sessionRef.current) {
      log("Cleanup", "Closing Gemini session");
      sessionRef.current.close();
      sessionRef.current = null;
    }

    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setVolume(0);
    log("Cleanup", "Cleanup complete");
  }, []);

  // Log component mount and cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Convert Float32Array to Int16Array for PCM
  const floatTo16BitPCM = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  };

  // Downsample audio from source sample rate to 16kHz
  const downsample = (
    buffer: Float32Array,
    fromRate: number,
    toRate: number,
  ): Float32Array => {
    if (fromRate === toRate) {
      return buffer;
    }
    const ratio = fromRate / toRate;
    const newLength = Math.floor(buffer.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = buffer[Math.floor(i * ratio)];
    }
    return result;
  };

  // Play audio from queue
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    if (!audioContextRef.current) {
      return;
    }

    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      if (!audioData || !audioContextRef.current) {
        continue;
      }

      try {
        const int16Array = new Int16Array(audioData);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768;
        }

        const audioBuffer = audioContextRef.current.createBuffer(
          1,
          float32Array.length,
          24000,
        );
        audioBuffer.getChannelData(0).set(float32Array);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      } catch (e) {
        log("Playback", "Error playing audio chunk", e);
      }
    }

    isPlayingRef.current = false;
  }, []);

  // Update volume meter
  const updateVolume = useCallback(() => {
    if (!analyserRef.current) {
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedVolume = average / 255;
    setVolume(normalizedVolume);

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    }
  }, [isListening]);

  // Start listening
  const startListening = async () => {
    log("Connection", "startListening called");
    try {
      setError(null);
      setStatus("connecting");

      const response = await fetch("/api/gemini-key");
      const { apiKey, error: apiError } = await response.json();

      if (apiError) {
        throw new Error(apiError);
      }

      const ai = new GoogleGenAI({ apiKey });

      audioContextRef.current = new AudioContext({ sampleRate: 48000 });

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      sourceRef.current = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current,
      );

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current.connect(analyserRef.current);

      processorRef.current = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1,
      );
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: {
            parts: [
              {
                text: "You are a helpful and friendly AI assistant. Keep your responses concise and conversational.",
              },
            ],
          },
        },
        callbacks: {
          onopen: () => {
            log("Connection", "WebSocket opened");
            setStatus("connected");
            setIsListening(true);
            isListeningRef.current = true;
          },
          onmessage: (message) => {
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              return;
            }

            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  audioQueueRef.current.push(bytes.buffer);
                  playAudioQueue();
                }
              }
            }

            if (message.serverContent?.turnComplete) {
              setMessages((prev) => [
                ...prev,
                { type: "assistant", status: "done" },
              ]);
            }
          },
          onerror: (e) => {
            log("Connection", "WebSocket error", e);
            setError(`Connection error: ${e.message}`);
            setStatus("error");
          },
          onclose: (e) => {
            log("Connection", `WebSocket closed: ${e.reason}`);
            setStatus("disconnected");
            setIsListening(false);
            isListeningRef.current = false;
          },
        },
      });

      sessionRef.current = session;

      processorRef.current.onaudioprocess = (e) => {
        if (!sessionRef.current || !isListeningRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const downsampled = downsample(
          inputData,
          audioContextRef.current!.sampleRate,
          16000,
        );
        const pcmData = floatTo16BitPCM(downsampled);

        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pcmData.buffer)),
        );

        sessionRef.current.sendRealtimeInput({
          audio: {
            data: base64,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      };

      updateVolume();
    } catch (err) {
      log("Connection", "Error in startListening", err);
      setError(err instanceof Error ? err.message : "Failed to start");
      setStatus("error");
      cleanup();
    }
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    setStatus("disconnected");
    cleanup();
  }, [cleanup]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening]);

  return {
    status,
    error,
    isListening,
    messages,
    volume,
    toggleListening,
    startListening,
    stopListening,
  };
}
