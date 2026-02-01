"use client";

import { Mic, MicOff, Phone, PhoneOff, Activity } from "lucide-react";
import { useGeminiLive } from "../hooks/useGeminiLive"; // Import the hook above

// Shadcn-like simplified components (Assuming you have these or standard HTML)
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WEBSOCKET_URL = "ws://localhost:8000/ws";

export default function GeminiChat() {
  const {
    isConnected,
    isSpeaking,
    isMicEnabled,
    error,
    connect,
    disconnect,
    toggleMic,
  } = useGeminiLive(WEBSOCKET_URL);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Gemini Live
          </CardTitle>
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className={
              isConnected
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }
          >
            {isConnected ? "Live" : "Offline"}
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
          {/* Audio Visualizer Placeholder */}
          <div className="relative flex items-center justify-center h-32 w-32">
            {isConnected ? (
              <>
                {/* Animated Rings when Bot Speaks */}
                {isSpeaking && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                )}
                <div
                  className={`relative flex items-center justify-center h-24 w-24 rounded-full transition-all duration-300 ${
                    isSpeaking ? "bg-blue-500 scale-110" : "bg-slate-200"
                  }`}
                >
                  <Activity
                    className={`w-10 h-10 ${isSpeaking ? "text-white" : "text-slate-400"}`}
                  />
                </div>
              </>
            ) : (
              <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <span className="text-slate-400 text-xs">Ready</span>
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-900">
              {isConnected
                ? isSpeaking
                  ? "Gemini is speaking..."
                  : "Listening..."
                : "Start conversation"}
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center space-x-4 pt-2 pb-6">
          {!isConnected ? (
            <Button
              size="lg"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
              onClick={connect}
            >
              <Phone className="w-4 h-4" />
              Connect
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-12 h-12 border-2 ${!isMicEnabled ? "bg-red-50 border-red-200 text-red-500" : "border-slate-200"}`}
                onClick={toggleMic}
              >
                {isMicEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
                onClick={disconnect}
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
