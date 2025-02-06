import { create } from 'zustand';
import { getDate } from '../utils/date';

interface DateState {
  date: Date;
  dateString: () => string;
  set: (date: Date) => void;
}

export const useDateStore = create<DateState>()((set, get) => ({
  date: new Date(),
  dateString: () => getDate(get().date),
  set: (date: Date) => set(() => ({ date })),
}));
