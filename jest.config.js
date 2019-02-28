module.exports = {
  testEnvironment: "node",

  collectCoverageFrom: [
    "lib/**/*.js",
    "!**/node_modules/**",
    "!**/_mocks_/**",
    "!**/__mocks__/**"
  ],

  coverageReporters: ["text-summary", "json", "html"],
  collectCoverage: true,
  coverageDirectory: "coverage/"
};
