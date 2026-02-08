// Vocabulary word structure
export interface Vocab {
  id: string;
  japanese_vocab: string;
  pronunciation: string;
  english_translation: string;
  timestamp: string;
  jlpt_level: number;
  checked: boolean;
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
