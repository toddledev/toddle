import { describe, expect, test } from '@jest/globals'
import { removeTestData } from './testData'

describe('removeTestData', () => {
  test('it removes testValue from attributes', () => {
    expect(
      removeTestData({
        attributes: {
          '1': {
            name: 'foo',
            testValue: 'bar',
          },
        },
      } as any),
    ).toEqual({
      attributes: {
        '1': {
          name: 'foo',
        },
      },
    })
  })
})
