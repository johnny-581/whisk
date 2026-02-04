import { NextResponse } from "next/server";

const BASE_URL = process.env.SERVER_BASE_URL!;

export async function POST(req: Request) {
  try {
    // TODO: implement database

    const body = await req.json();
    const { video_id } = body as { video_id: string };

    if (!video_id) {
      return NextResponse.json(
        { error: "video_id is required" },
        { status: 400 }
      );
    }

    const result = await fetch(`${BASE_URL}/vocab-extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_id }),
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
