import { describe, expect, test } from '@jest/globals'
import handler from './handler'

describe('Formula: Logarithm', () => {
  test('should return the logarithm of the number', () => {
    expect(handler([-1], undefined as any)).toBe(NaN)
    expect(handler([0], undefined as any)).toBe(-Infinity)
    expect(handler([1], undefined as any)).toBe(0)
    expect(handler([10], undefined as any)).toBe(2.302585092994046)
  })
})
