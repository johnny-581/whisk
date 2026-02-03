import { VideoDetail } from "@/features/dashboard/VideoDetail";

interface VideoPageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;
  return <VideoDetail videoId={videoId} />;
}
