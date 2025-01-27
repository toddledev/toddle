import { describe, expect, test } from '@jest/globals'
import { applyTemplateValues } from './template'

describe('template', () => {
  test('it replaces all injected cookie values', () => {
    expect(
      applyTemplateValues(
        'this is a test {{ cookies.access_token }} and another value {{ cookies.refresh_token }} + finally {{ cookies.access_token }}',
        {
          access_token: 'my-access-token',
          refresh_token: 'my-refresh-token',
        },
      ),
    ).toEqual(
      'this is a test my-access-token and another value my-refresh-token + finally my-access-token',
    )
  })
})
