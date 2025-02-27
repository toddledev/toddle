import fastDeepEqual from 'fast-deep-equal'

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    toddle: {
      isEqual: fastDeepEqual,
    },
  },
}
