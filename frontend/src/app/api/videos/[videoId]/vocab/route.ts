import { NextResponse } from "next/server";

const DEFAULT_VOCAB = [
  "taberu",
  "miru",
  "iku",
  "yomu",
  "nomu",
  "kiku",
  "aruku",
  "hanasu",
  "kaku",
  "kau",
];

const VIDEO_VOCAB: Record<string, string[]> = {
  default: DEFAULT_VOCAB,
  "219beSEfbqA": [
    "taberu",
    "miru",
    "iku",
    "yomu",
    "nomu",
    "kiku",
    "aruku",
    "hanasu",
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const vocab: string[] = VIDEO_VOCAB[videoId] ?? DEFAULT_VOCAB;
  return NextResponse.json({
    videoId,
    vocab: vocab.map((word: string) => ({ word })),
  });
}
