import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  jlptLevel: number | null; // 1 for N1, 5 for N5
  setJlptLevel: (level: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  // The 'persist' middleware saves the level in the browser 
  // so it doesn't disappear when they refresh the page!
  persist(
    (set) => ({
      jlptLevel: null,
      setJlptLevel: (level) => set({ jlptLevel: level }),
      reset: () => set({ jlptLevel: null }),
    }),
    {
      name: 'user-japanese-level', // unique name for storage
    }
  )
);

export interface Video {
  id: string;
  video_id: string;
  title: string;
}

interface VideosState {
  videos: Video[];
  setVideos: (videos: Video[]) => void;
  addVideo: (video: Video) => void;
  upsertVideo: (video: Video) => void;
  clearVideos: () => void;
}

export const useVideosStore = create<VideosState>((set) => ({
  videos: [],
  setVideos: (videos) => set({ videos }),

  addVideo: (video) =>
    set((state) => ({
      videos: [video, ...state.videos],
    })),

  // Prevent duplicates if you save same video twice
  upsertVideo: (video) =>
    set((state) => {
      const idx = state.videos.findIndex((v) => v.video_id === video.video_id);
      if (idx === -1) return { videos: [video, ...state.videos] };
      const copy = [...state.videos];
      copy[idx] = { ...copy[idx], ...video };
      return { videos: copy };
    }),

  clearVideos: () => set({ videos: [] }),
}));



