const config = {
  // Setup files after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom', // Specify the updated environment
  // Transform files with ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta',
              options: {
                metaObjectReplacement: {
                  env: {
                  REACT_APP_API_BASE_URL:"http://159.203.130.16:8000",
                  VITE_API_URL:"http://159.203.130.16:8000",
                  STREAM_API_KEY :"rxuvyjpj3ypg",
                  unsplashClientID : "iOr5vyX_LfiZMm-ysjSylELbHmT6wi8xzxbtIthJ45w",
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
  testPathIgnorePatterns: [  // Ignore patterns
  "/node_modules/",
  "<rootDir>/src/react-tests/MapPage.test.tsx",  // Path to the test file you want to ignore
  "<rootDir>/src/react-tests/OptionsCardContainer.test.tsx"
],
  // Module name mapper for alias resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.ts",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
};
export default config;