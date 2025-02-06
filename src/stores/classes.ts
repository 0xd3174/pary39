import { create } from 'zustand';
import { IClass } from '../utils/scrape';

interface ClassesState {
  classes: {
    [key: string]: IClass[];
  };
  add: (date: string, classes: IClass[]) => void;
}

export const useClassesStore = create<ClassesState>()((set) => ({
  classes: {},
  add: (date: string, classes: IClass[]) => 
    set((state) => ({
      classes: {
        ...state.classes,
        [date]: classes,
      },
    })),
}));