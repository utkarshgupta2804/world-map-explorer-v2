module.exports = {
  testEnvironment: "jest-environment-jsdom", // Use the correct environment module
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.jsx$": "babel-jest",
    "^.+\\.ts$": "babel-jest",
    "^.+\\.tsx$": "babel-jest",
  },
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["./setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: ["node_modules/(?!(node-fetch)/)"],
  // Adjust this pattern to match your test folder
};
