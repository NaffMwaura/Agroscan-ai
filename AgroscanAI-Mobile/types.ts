export interface AnalysisResult {
  filename: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  status?: string;
  message?: string;
  recommendation?: string;
  scan_id?: string | number;
}

export interface UserState {
  userToken: string | null;
  userId: string | null;
  userEmail: string | null;
}

// Mobile navigation doesn't need 'Page' types as Expo Router handles this via files