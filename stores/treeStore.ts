import { create } from 'zustand';

interface TreeStore {
  scrollProgress: number; // smoothed
  targetScrollProgress: number; // raw from scroll event
  selectedUserId: string | null;
  hoveredUserId: string | null;
  hoveredRelationshipType: string | null;
  setScrollProgress: (progress: number) => void;
  setTargetScrollProgress: (progress: number) => void;
  setSelectedUser: (id: string | null) => void;
  setHoveredUser: (id: string | null, type?: string | null) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  scrollProgress: 0,
  targetScrollProgress: 0,
  selectedUserId: null,
  hoveredUserId: null,
  hoveredRelationshipType: null,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setTargetScrollProgress: (progress) => set({ targetScrollProgress: progress }),
  setSelectedUser: (id) => set({ selectedUserId: id }),
  setHoveredUser: (id, type = null) => set({ hoveredUserId: id, hoveredRelationshipType: type }),
}));
