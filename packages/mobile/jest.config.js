module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // The first test in each suite pays the React Native cold-start (module
  // load + first render), and jest runs suites in parallel workers — on a
  // loaded CI runner that cold-start alone can exceed Jest's 5s default
  // (seen as a timeout on the first OtpSignIn test with the test itself
  // green in ~0.6s standalone). Give the tests headroom.
  testTimeout: 15000,
};
