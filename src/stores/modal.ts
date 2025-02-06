import { create } from 'zustand';

interface ModalState {
  id: Maybe<string>;
  close: () => void;
  open: (id: string) => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  id: null,
  open: (id: string) => set(() => ({ id })),
  close: () => set(() => ({ id: null })),
}));
