import { NextResponse } from "next/server";

const BASE_URL = process.env.SERVER_BASE_URL!;

/**
 * GET /api/videos/[videoId] - Get full video details
 * Returns complete video information including all vocab
 * videoId is the internal UUID
 */
export async function GET(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    const result = await fetch(`${BASE_URL}/videos/${videoId}`, {
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
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/videos/[videoId] - Delete a video and its associations
 * videoId is the internal UUID
 * Cascades to delete all video_vocab associations
 */
export async function DELETE(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    const result = await fetch(`${BASE_URL}/videos/${videoId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!result.ok) {
      const text = await result.text();
      return NextResponse.json({ error: text }, { status: result.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
