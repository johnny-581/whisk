// Vocabulary word structure
export interface VocabWord {
  id?: string;
  word: string;
  difficulty?: string;
  start_time?: string;
}

// Props for main VocabLiveChat component
export interface VocabLiveChatProps {
  conversationId?: string;
}

// Server message structure
export interface ServerMessage {
  type: string;
  payload?: string;
}

// User transcript data structure
export interface UserTranscriptData {
  text: string;
  final?: boolean;
  timestamp: string;
  user_id: string;
}

// Word structure with active state
export interface Word extends VocabWord {
  active: boolean;
}
