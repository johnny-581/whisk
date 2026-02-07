import { NextResponse } from "next/server";

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

export async function POST(request: Request) {
  const configuredBase =
    process.env.SERVER_BASE_URL || "http://localhost:8000/";
  const serverBaseUrl = trimTrailingSlash(configuredBase);

  if (!serverBaseUrl) {
    console.log(
      "SERVER_BASE_URL not configured, using default: http://localhost:8000/"
    );
  }

  const botStartUrl = `${serverBaseUrl}/vocab-live-chat/start`;

  try {
    // Parse the request body from the client
    const requestData = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (process.env.BOT_START_PUBLIC_API_KEY) {
      headers.Authorization = `Bearer ${process.env.BOT_START_PUBLIC_API_KEY}`;
    }

    // Pass through the request data from the client
    const response = await fetch(botStartUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(
        `Failed to connect to Pipecat: ${response.status} ${response.statusText} ${rawText}`
      );
    }

    let data: unknown;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (parseError) {
      throw new Error(`Invalid JSON from backend: ${rawText}`);
    }

    console.log(data);

    if (typeof data === "object" && data && "error" in data) {
      throw new Error((data as { error: string }).error);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process connection request: ${error}` },
      { status: 500 }
    );
  }
}
