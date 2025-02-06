import { create } from 'zustand';

interface DropdownState {
  id: Maybe<string>;
  close: () => void;
  open: (id: string) => void;
  change: (id: string) => void;
}

export const useDropdownStore = create<DropdownState>()((set, get) => ({
  id: null,
  open: (id: string) => set(() => ({ id })),
  close: () => set(() => ({ id: null })),
  change: (id: string) => set(() => ({ id: get().id ? null : id })),
}));
