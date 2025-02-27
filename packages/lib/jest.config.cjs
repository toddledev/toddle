const fastDeepEqual = require('fast-deep-equal')
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    toddle: {
      isEqual: fastDeepEqual,
    },
  },
}
