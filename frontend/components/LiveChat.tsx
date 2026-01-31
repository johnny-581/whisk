"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useGeminiLive } from "@/hooks/useGeminiLive";

export default function LiveChat() {
  const { status, error, isListening, volume, toggleListening } =
    useGeminiLive();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-3xl font-bold">Gemini Live Chat</h1>

      <div className="flex flex-col items-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === "connected"
                ? "bg-green-500 animate-pulse"
                : status === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : status === "error"
                    ? "bg-red-500"
                    : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-muted-foreground capitalize">
            {status}
          </span>
        </div>

        {/* Volume indicator */}
        {isListening && (
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        )}

        {/* Main button */}
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          onClick={toggleListening}
          disabled={status === "connecting"}
          className="w-24 h-24 rounded-full"
        >
          {status === "connecting" ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          {status === "connecting"
            ? "Connecting..."
            : isListening
              ? "Listening... Click to stop"
              : "Click to start talking"}
        </p>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg max-w-md text-center">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
          <p>
            This uses the Gemini Live API for real-time voice conversation. Echo
            cancellation is enabled to prevent feedback loops.
          </p>
        </div>
      </div>
    </div>
  );
}
