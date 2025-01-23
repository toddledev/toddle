import { valueFormula } from '@toddledev/core/dist/formula/formulaUtils'
import { searchProject } from '../searchProject'
import { unknownEventRule } from './unknownEventRule'

describe('unknownEvent', () => {
  test('should report unknown events', () => {
    const problems = Array.from(
      searchProject({
        files: {
          components: {
            test: {
              name: 'test',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {},
                  tag: 'div',
                  children: [],
                  style: {},
                },
                myNode: {
                  type: 'component',
                  name: 'test',
                  attrs: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerEvent',
                          event: 'unknown-event',
                          data: valueFormula(null),
                        },
                      ],
                    },
                  },
                  children: [],
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              events: [
                {
                  name: 'known-event',
                  // eslint-disable-next-line inclusive-language/use-inclusive-words
                  dummyEvent: {
                    name: 'Name',
                  },
                },
              ],
            },
          },
        },
        rules: [unknownEventRule],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('unknown event')
    expect(problems[0].details).toEqual({ name: 'click' })
    expect(problems[0].path).toEqual([
      'components',
      'test',
      'nodes',
      'myNode',
      'events',
      'click',
    ])
  })

  test('should not report events that exist', () => {
    const problems = Array.from(
      searchProject({
        files: {
          components: {
            test: {
              name: 'test',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {},
                  tag: 'div',
                  children: [],
                  style: {},
                },
                myNode: {
                  type: 'component',
                  name: 'test',
                  attrs: {},
                  events: {
                    'known-event': {
                      trigger: 'known-event',
                      actions: [
                        {
                          type: 'TriggerEvent',
                          event: 'unknown-event',
                          data: valueFormula(null),
                        },
                      ],
                    },
                  },
                  children: [],
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              events: [
                {
                  name: 'known-event',
                  // eslint-disable-next-line inclusive-language/use-inclusive-words
                  dummyEvent: {
                    name: 'Name',
                  },
                },
              ],
            },
          },
        },
        rules: [unknownEventRule],
      }),
    )

    expect(problems).toEqual([])
  })
})
