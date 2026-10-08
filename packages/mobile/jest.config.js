module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFiles: ['./jest.setup.js'],
  // The 'react-native' preset's default pattern doesn't allow
  // react-native-reanimated through; its mock.js requires its own
  // TypeScript source, which must be babel-transformed.
  transformIgnorePatterns: ['node_modules/(?!(react-native|@react-native|react-native-reanimated)/)'],
  // The first test in each suite pays the React Native cold-start (module
  // load + first render), and jest runs suites in parallel workers — on a
  // loaded CI runner that cold-start alone can exceed Jest's 5s default
  // (seen as a timeout on the first OtpSignIn test with the test itself
  // green in ~0.6s standalone). Give the tests headroom.
  testTimeout: 15000,
};
