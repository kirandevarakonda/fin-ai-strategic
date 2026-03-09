
import { User, FinancialProfile, Recommendation, ChatMessage } from '../types';

const KEYS = {
  USER: 'finai_user',
  PROFILE: 'finai_profile',
  RECOMMENDATIONS: 'finai_recommendations',
  CHAT_HISTORY: 'finai_chat_history'
};

export const storageService = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  getProfile: (): FinancialProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },
  setProfile: (profile: FinancialProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },
  getRecommendations: (): Recommendation[] => {
    const data = localStorage.getItem(KEYS.RECOMMENDATIONS);
    return data ? JSON.parse(data) : [];
  },
  setRecommendations: (recs: Recommendation[]) => {
    localStorage.setItem(KEYS.RECOMMENDATIONS, JSON.stringify(recs));
  },
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  setChatHistory: (history: ChatMessage[]) => {
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history));
  },
  clearAll: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
};
