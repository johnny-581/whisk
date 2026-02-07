import { NextResponse } from "next/server";

const BASE_URL = process.env.SERVER_BASE_URL!;

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
