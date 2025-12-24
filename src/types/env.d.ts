declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_URL?: string;
      APP_ENV?: 'development' | 'staging' | 'production';
    }
  }
}

export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
}

export {};
