# Application Navigation Structure

## Route Groups

### 1. Dashboard Group `(dashboard)`

**Layout**: Top navigation bar with links to Dashboard, Upload, and Settings

#### Routes:

- `/` - Dashboard home page
  - Shows overview cards for videos, practice sessions, and progress
  - Quick action button to upload new video
- `/videos/new` - Upload new video
  - Form to submit YouTube URL
  - Redirects to video detail after processing
- `/videos/[videoId]` - Video detail page
  - Shows video information
  - Displays extracted vocabulary
  - Button to start practice session

### 2. Conversation Group `(conversation)`

**Layout**: Minimal layout for full-screen chat interface

#### Routes:

- `/conversations/[conversationId]` - Live chat practice
  - Full-screen AI conversation interface
  - Uses the VocabLiveChat feature component

### 3. Onboarding Group `(onboarding)`

**Layout**: Centered layout with gradient background

#### Routes:

- `/onboarding` - Onboarding wizard
  - Multi-step wizard for user setup
  - Collects years studied and proficiency level
  - Redirects to dashboard on completion

## Feature Components

All main page logic is located in `/src/features/`:

- **Dashboard Features** (`/features/dashboard/`)

  - `DashboardContent.tsx` - Main dashboard view
  - `VideoUploadForm.tsx` - Video upload interface
  - `VideoDetail.tsx` - Video detail and vocabulary display

- **Conversation Features** (`/features/conversation/`)

  - `VocabLiveChat.tsx` - AI chat interface wrapper
  - Components in `/components/` subdirectory

- **Onboarding Features** (`/features/onboarding/`)
  - `OnboardingWizard.tsx` - Multi-step onboarding flow

## Navigation Flow

```
Root (/)
  → Dashboard (/)
    → Upload Video (/videos/new)
      → Video Detail (/videos/123)
        → Practice (/conversations/123)
    → Settings (/onboarding)
```

## UI Components Used

- **shadcn/ui**:
  - Button
  - Card (CardHeader, CardTitle, CardDescription, CardContent)
- **Next.js**: Link, useRouter
- Custom styling with Tailwind CSS
