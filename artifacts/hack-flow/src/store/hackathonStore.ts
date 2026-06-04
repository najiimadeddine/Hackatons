import { create } from 'zustand';
import { LeaderboardEntry } from '@workspace/api-client-react';

interface HackathonState {
  activeHackathonId: number | null;
  leaderboardEntries: LeaderboardEntry[];
  setActiveHackathon: (id: number | null) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
}

export const useHackathonStore = create<HackathonState>((set) => ({
  activeHackathonId: null,
  leaderboardEntries: [],
  setActiveHackathon: (id) => set({ activeHackathonId: id }),
  updateLeaderboard: (entries) => set({ leaderboardEntries: entries })
}));
