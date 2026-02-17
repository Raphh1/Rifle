export default {
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['./tests/setup.js']
};