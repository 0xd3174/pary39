import { create } from 'zustand';

interface GroupState {
  group: Maybe<string>;
  set: (group: Maybe<string>) => void;
}

export const useGroupStore = create<GroupState>()((set) => ({
  group: null,
  set: (group: Maybe<string>) => set(() => ({ group })),
}));

interface GroupChooserState {
  level: Maybe<string>;
  setLevel: (level: string) => void;
  course: Maybe<string>;
  setCourse: (course: string) => void;
}

export const useGroupChooserStore = create<GroupChooserState>()((set) => ({
  level: null,
  setLevel: (level: string) => set(() => ({ level })),
  course: null,
  setCourse: (course: string) => set(() => ({ course })),
}));
