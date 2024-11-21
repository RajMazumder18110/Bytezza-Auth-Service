/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  maxWorkers: 1,
  verbose: true,
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
};
