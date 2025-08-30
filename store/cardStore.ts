import { create, StoreApi } from 'zustand';
import { Person } from '@/types/card';

// 确保你的 store 中有这些相关状态和方法
type CardStore = {
  person: Person;
  activeTab: string;
  template: string;
  isRecognizing: boolean;
  recognizeProgress: number; // 0-100
  setActiveTab: (tab: string) => void;
  setTemplate: (template: string) => void;
  setPerson: (person: Partial<Person>) => void;
  setRecognizing: (flag: boolean) => void;
  setRecognizeProgress: (progress: number) => void;
};

// 创建默认的空 Person 对象
const defaultPerson: Person = {
  givenName: '',
  familyName: '',
  jobTitle: '',
  organization: '',
  email: '',
  phone: '',
  website: '',
  location: '',
  socials: [],
};

// 导出 useCardStore 而不是 useStore
export const useCardStore = create<CardStore>((set: StoreApi<CardStore>['setState']) => ({
  person: defaultPerson,
  activeTab: 'basics',
  template: 'classic',
  isRecognizing: false,
  recognizeProgress: 0,

  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setTemplate: (template: string) => set({ template }),
  setPerson: (personData: Partial<Person>) => set((state: CardStore) => ({
    person: { ...state.person, ...personData }
  })),
  setRecognizing: (flag: boolean) => set({ isRecognizing: flag }),
  setRecognizeProgress: (progress: number) => set({ recognizeProgress: progress }),
}));