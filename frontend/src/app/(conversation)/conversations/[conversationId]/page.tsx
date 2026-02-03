import { VocabLiveChat } from "@/features/conversation/VocabLiveChat";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;
  return <VocabLiveChat conversationId={conversationId} />;
}
