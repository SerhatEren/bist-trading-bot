export enum Environment {
  PRODUCTION = 'production',
  TEST = 'test',
  DEVELOPMENT = 'development'
}

export const getEnvironment = () => {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  
  return {
    env: env as Environment,
    isTestMode: env === Environment.TEST,
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    isDevelopment: env === Environment.DEVELOPMENT,
    isProduction: env === Environment.PRODUCTION
  };
};

export const environment = getEnvironment(); 