/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@supabase/(.*)$': '<rootDir>/node_modules/@supabase/$1',
    '^next/(.*)$': '<rootDir>/node_modules/next/$1',
    '^next$': '<rootDir>/node_modules/next',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transformIgnorePatterns: ['/node_modules/(?!@supabase)/'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config;
