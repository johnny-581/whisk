import { NextResponse } from "next/server";

const BASE_URL = process.env.SERVER_BASE_URL!;

/**
 * GET /api/videos - List all videos for sidebar
 * Returns only id, title, and tags for each video
 */
export async function GET() {
  try {
    const result = await fetch(`${BASE_URL}/videos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!result.ok) {
      const text = await result.text();
      return NextResponse.json({ error: text }, { status: result.status });
    }

    const data = await result.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos - Create a new video with vocab
 * Persists video metadata and all associated vocabulary
 * Idempotent: updates existing video if video_id already exists
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.video_id || !body.title) {
      return NextResponse.json(
        { error: "video_id and title are required" },
        { status: 400 }
      );
    }

    const result = await fetch(`${BASE_URL}/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      const text = await result.text();
      return NextResponse.json({ error: text }, { status: result.status });
    }

    const data = await result.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
