import { NextResponse } from "next/server";

const BASE_URL = process.env.SERVER_BASE_URL!;

export async function POST(req: Request) {
  try {
    // TODO: implement database

    const body = await req.json();
    const { video_url, user_level} = body as { video_url: string, user_level: number};

    if (!video_url) {
      return NextResponse.json(
        { error: "video_url is required" },
        { status: 400 }
      );
    }
    console.log(body)
    const result = await fetch(`${BASE_URL}/video_analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      const text = await result.text();
      return NextResponse.json(
        { error: text },
        { status: result.status }
      );
    }

    const data = await result.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process connection request" },
      { status: 500 }
    );
  }
}
