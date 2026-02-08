# VocabLiveChat Feature

A real-time vocabulary practice conversation system using voice interaction.

## Architecture

This feature has been refactored into a modular, maintainable structure:

### Directory Structure

```
conversation/
├── components/           # UI components
│   ├── AgentSpeechBubble.tsx
│   ├── ConnectionButton.tsx
│   ├── ExitModal.tsx
│   └── WordTracker.tsx
├── hooks/               # Custom React hooks
│   ├── useVocabData.ts          # Fetch vocabulary data & manage user level
│   ├── useWordTracking.ts       # Track word completion state
│   ├── useConversationState.ts  # Manage connection & navigation
│   └── index.ts
├── utils/               # Utility functions
│   ├── vocab.ts         # Vocabulary normalization & selection
│   └── wordMatching.ts  # Transcript matching logic
├── VocabLiveChat.tsx    # Main feature component (includes UI)
├── config.ts            # Transport configuration
├── constants.ts         # Feature constants
├── types.ts             # TypeScript type definitions
└── README.md
```

## Components

### VocabLiveChat

Main component that:

- Fetches user level and vocabulary data
- Configures Pipecat client connection
- Provides theme and full-screen container
- Renders the conversation interface
- Displays word tracker and agent speech bubble
- Manages connection controls and exit modal
- Handles initialization errors

## Hooks

### useVocabData

Fetches vocabulary words for a video and manages user's JLPT level.

- Syncs user level from Zustand store or localStorage
- Handles API calls with abort controller
- Normalizes word data and level format (N1-N5)
- Falls back to default words on error
- Returns: `{ words, isLoading, error, userLevel }`

### useWordTracking

Tracks word completion state and matches user transcripts.

- Listens to RTVI events (ServerMessage, UserTranscript)
- Marks words as completed when detected
- Uses sophisticated matching logic
- Returns: `{ words, allCompleted }`

### useConversationState

Manages connection state and navigation.

- Handles connect/disconnect actions
- Manages exit modal visibility
- Listens to RTVI connection events
- Handles completion navigation
- Returns: connection state and handlers

## Utilities

### vocab.ts

- `pickRandomRange()` - Selects random subset of items
- `normalizeLevel()` - Validates and normalizes JLPT levels
- `normalizeWord()` - Normalizes various word entry formats

### wordMatching.ts

- `normalizeForMatch()` - Removes punctuation/whitespace
- `normalizeRomaji()` - Normalizes romanized text
- `romanize()` - Converts Japanese to romaji
- `variantsForWord()` - Gets all valid word variants
- `isWordMatch()` - Checks if transcript matches target word

## Constants

- `FALLBACK_WORDS` - Default vocabulary list
- `MIN_VOCAB` / `MAX_VOCAB` - Vocabulary count range
- `DEFAULT_USER_LEVEL` - Default JLPT level (N3)
- `VALID_JLPT_LEVELS` - Valid level values

## Types

- `VocabWord` - Vocabulary word structure
- `Word` - Word with active state
- `VocabLiveChatProps` - Main component props
- `VocabLiveChatContentProps` - Content component props
- `ServerMessage` - Server message structure
- `UserTranscriptData` - User transcript structure

## Key Features

### Word Matching

Sophisticated matching algorithm that handles:

- Direct text matching
- Hiragana, Katakana, and Kanji variants
- Romanization (with r/l substitution)
- Punctuation and spacing normalization

### State Management

- Vocabulary loading with fallback
- Connection state tracking
- Word completion tracking
- Exit flow handling

### User Experience

- Escape key to show exit modal
- Auto-navigation on completion
- Loading states
- Error handling with fallback data

## Usage

```tsx
import { VocabLiveChat } from "@/features/conversation";

// In your page/component
<VocabLiveChat conversationId={videoId} />;
```

## Future Improvements

- [ ] Extract romanization to external library
- [ ] Add more comprehensive word variant mappings
- [ ] Implement retry logic for failed API calls
- [ ] Add analytics/telemetry hooks
- [ ] Support for custom vocabulary lists
- [ ] Difficulty adjustment based on performance
