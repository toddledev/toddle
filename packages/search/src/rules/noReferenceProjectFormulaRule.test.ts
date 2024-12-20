import { searchProject } from '../searchProject'
import { noReferenceProjectFormulaRule } from './noReferenceProjectFormulaRule'

describe('noReferenceFormulaRule', () => {
  test('should detect unused global formulas', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {
            'my-formula': {
              name: 'my-formula',
              arguments: [],
              formula: {
                type: 'value',
                value: 'value',
              },
            },
          },
          components: {
            test: {
              name: 'test',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
            },
          },
        },
        rules: [noReferenceProjectFormulaRule],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('no-reference project formula')
    expect(problems[0].path).toEqual(['formulas', 'my-formula'])
  })

  test('should detect 1 unused global formulas', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {
            'my-formula-1': {
              name: 'my-formula-1',
              arguments: [],
              formula: {
                type: 'value',
                value: 'value',
              },
            },
            'my-formula-2': {
              name: 'my-formula-2',
              arguments: [],
              formula: {
                type: 'function',
                name: 'my-formula-1',
                arguments: [
                  {
                    name: 'my-formula-1',
                    formula: {
                      type: 'value',
                      value: 'value',
                    },
                  },
                ],
              },
            },
          },
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
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
            },
          },
        },
        rules: [noReferenceProjectFormulaRule],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('no-reference project formula')
    expect(problems[0].path).toEqual(['formulas', 'my-formula-2'])
  })

  test('should not detect unused global formulas', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {
            'my-formula-1': {
              name: 'my-formula-1',
              arguments: [],
              formula: {
                type: 'value',
                value: 'value',
              },
            },
            'my-formula-2': {
              name: 'my-formula-2',
              arguments: [],
              formula: {
                type: 'value',
                value: 'value',
              },
            },
          },
          components: {
            test: {
              name: 'test',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {
                    'my-class': {
                      formula: {
                        type: 'function',
                        name: 'my-formula-2',
                        arguments: [],
                      },
                    },
                  },
                  events: {},
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {
                'my-formula-3': {
                  name: 'my-formula-3',
                  arguments: [],
                  formula: {
                    type: 'function',
                    name: 'my-formula-1',
                    arguments: [
                      {
                        name: 'my-formula-1',
                        formula: {
                          type: 'value',
                          value: 'value',
                        },
                      },
                    ],
                  },
                },
              },
              apis: {},
              attributes: {},
              variables: {},
            },
          },
        },
        rules: [noReferenceProjectFormulaRule],
      }),
    )

    expect(problems).toEqual([])
  })
})
