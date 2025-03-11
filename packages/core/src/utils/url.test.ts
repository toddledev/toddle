import { describe, expect, test } from '@jest/globals'
import { validateUrl } from './url'

describe('validateUrl()', () => {
  test('it validates urls correctly', () => {
    expect(validateUrl('https://toddle.dev')).toBeInstanceOf(URL)
    expect(validateUrl('not-a-url')).toBe(false)
  })

  test('it validates urls arrays in query params correctly', async () => {
    const url = validateUrl('https://toddle.dev?test=1&test=2')
    expect(url).toBeInstanceOf(URL)
    if (url instanceof URL) {
      expect(url.searchParams.getAll('test')).toEqual(['1', '2'])
    }
  })
})
