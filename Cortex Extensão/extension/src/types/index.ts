export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  tokens: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OnboardingData {
  studyLevel: 'Ativo' | 'Inativo';
  dailyStudyHours: number;
  objective: string;
  targetJob: string;
  hasEdital: boolean;
  editalFile?: File;
  fatigueLevel: 'Baixo' | 'Médio' | 'Alto';
  examDate?: string;
  routine: {
    works: boolean;
    fullTimeStudent: boolean;
    workHours?: string;
    commuteTime?: string;
    hasChildren: boolean;
    peakEnergyTime: string;
    freeDays: string[];
  };
}
