module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
