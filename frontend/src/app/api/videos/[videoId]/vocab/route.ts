import { NextResponse } from "next/server";

interface MockVocab {
  id: string;
  word: string;
  difficulty: string;
  start_time?: string;
}

const LEVEL_VOCAB: Record<string, MockVocab[]> = {
  N5: [
    { id: "n5-1", word: "taberu", difficulty: "N5", start_time: "00:12" },
    { id: "n5-2", word: "miru", difficulty: "N5", start_time: "00:25" },
    { id: "n5-3", word: "iku", difficulty: "N5", start_time: "00:40" },
    { id: "n5-4", word: "nomu", difficulty: "N5", start_time: "01:05" },
    { id: "n5-5", word: "kiku", difficulty: "N5", start_time: "01:22" },
    { id: "n5-6", word: "hanasu", difficulty: "N5", start_time: "02:10" },
    { id: "n5-7", word: "kau", difficulty: "N5", start_time: "02:45" },
    { id: "n5-8", word: "aruku", difficulty: "N5", start_time: "03:02" },
    { id: "n5-9", word: "kaku", difficulty: "N5", start_time: "03:35" },
    { id: "n5-10", word: "osu", difficulty: "N5", start_time: "03:58" },
  ],
  N4: [
    { id: "n4-1", word: "tsutaeru", difficulty: "N4", start_time: "00:18" },
    { id: "n4-2", word: "uketsukeru", difficulty: "N4", start_time: "00:36" },
    { id: "n4-3", word: "motomeru", difficulty: "N4", start_time: "01:02" },
    { id: "n4-4", word: "tazuneru", difficulty: "N4", start_time: "01:21" },
    { id: "n4-5", word: "kangaeru", difficulty: "N4", start_time: "01:49" },
    { id: "n4-6", word: "uketoru", difficulty: "N4", start_time: "02:11" },
    { id: "n4-7", word: "erabu", difficulty: "N4", start_time: "02:39" },
    { id: "n4-8", word: "hazureru", difficulty: "N4", start_time: "03:07" },
    { id: "n4-9", word: "sawaru", difficulty: "N4", start_time: "03:41" },
    { id: "n4-10", word: "shiraberu", difficulty: "N4", start_time: "04:03" },
  ],
  N3: [
    { id: "n3-1", word: "keiyaku", difficulty: "N3", start_time: "00:15" },
    { id: "n3-2", word: "kosei", difficulty: "N3", start_time: "00:33" },
    { id: "n3-3", word: "juyou", difficulty: "N3", start_time: "01:08" },
    { id: "n3-4", word: "kyoka", difficulty: "N3", start_time: "01:44" },
    { id: "n3-5", word: "riyuu", difficulty: "N3", start_time: "02:05" },
    { id: "n3-6", word: "gaiyou", difficulty: "N3", start_time: "02:29" },
    { id: "n3-7", word: "saikou", difficulty: "N3", start_time: "02:55" },
    { id: "n3-8", word: "hanei", difficulty: "N3", start_time: "03:16" },
    { id: "n3-9", word: "taisaku", difficulty: "N3", start_time: "03:40" },
    { id: "n3-10", word: "kouryo", difficulty: "N3", start_time: "04:02" },
  ],
  N2: [
    { id: "n2-1", word: "kasou", difficulty: "N2", start_time: "00:12" },
    { id: "n2-2", word: "keisei", difficulty: "N2", start_time: "00:29" },
    { id: "n2-3", word: "kakushin", difficulty: "N2", start_time: "00:55" },
    { id: "n2-4", word: "saido", difficulty: "N2", start_time: "01:19" },
    { id: "n2-5", word: "shikou", difficulty: "N2", start_time: "01:41" },
    { id: "n2-6", word: "kyukaku", difficulty: "N2", start_time: "02:03" },
    { id: "n2-7", word: "shusai", difficulty: "N2", start_time: "02:26" },
    { id: "n2-8", word: "kyozon", difficulty: "N2", start_time: "02:52" },
    { id: "n2-9", word: "fukugen", difficulty: "N2", start_time: "03:21" },
    { id: "n2-10", word: "jittai", difficulty: "N2", start_time: "03:49" },
  ],
  N1: [
    { id: "n1-1", word: "rakugai", difficulty: "N1", start_time: "00:14" },
    { id: "n1-2", word: "genkyo", difficulty: "N1", start_time: "00:31" },
    { id: "n1-3", word: "youso", difficulty: "N1", start_time: "00:47" },
    { id: "n1-4", word: "kousou", difficulty: "N1", start_time: "01:09" },
    { id: "n1-5", word: "hankou", difficulty: "N1", start_time: "01:33" },
    { id: "n1-6", word: "kyoukou", difficulty: "N1", start_time: "01:56" },
    { id: "n1-7", word: "kaishaku", difficulty: "N1", start_time: "02:17" },
    { id: "n1-8", word: "renshou", difficulty: "N1", start_time: "02:39" },
    { id: "n1-9", word: "touhai", difficulty: "N1", start_time: "03:06" },
    { id: "n1-10", word: "seisoku", difficulty: "N1", start_time: "03:32" },
  ],
};

const VIDEO_SPECIFIC: Record<string, MockVocab[]> = {
  "219beSEfbqA": LEVEL_VOCAB.N4,
  default: LEVEL_VOCAB.N5,
};

const normalizeLevel = (level?: string) => {
  const upper = (level || "").toUpperCase();
  return ["N1", "N2", "N3", "N4", "N5"].includes(upper) ? upper : "N3";
};

const sampleVocab = (items: MockVocab[], min = 6, max = 10) => {
  if (items.length <= min) return items;
  const upper = Math.min(max, items.length);
  const target =
    min + Math.floor(Math.random() * Math.max(1, upper - min + 1));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, target);
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const { searchParams } = new URL(request.url);
  const level = normalizeLevel(searchParams.get("level") || undefined);

  const baseVocab = VIDEO_SPECIFIC[videoId] ?? LEVEL_VOCAB[level] ?? [];
  const fallback = LEVEL_VOCAB[level] ?? [];
  const chosen = baseVocab.length > 0 ? baseVocab : fallback;
  const sampled = sampleVocab(chosen);

  return NextResponse.json({
    videoId,
    level,
    vocab: sampled,
  });
}
