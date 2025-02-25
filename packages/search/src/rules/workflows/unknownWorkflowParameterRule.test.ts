import { valueFormula } from '@toddledev/core/dist/formula/formulaUtils'
import { searchProject } from '../../searchProject'
import { unknownWorkflowParameterRule } from './unknownWorkflowParameterRule'

describe('unknownWorkflowParameterRule', () => {
  test('should detect unknown workflow parameters', () => {
    const problems = Array.from(
      searchProject({
        files: {
          components: {
            myComponent: {
              name: 'myComponent',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerWorkflow',
                          workflow: 'my-workflow',
                          parameters: {
                            unknownParameter: {
                              formula: valueFormula(4),
                            },
                          },
                        },
                      ],
                    },
                  },
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              workflows: {
                ['my-workflow']: {
                  actions: [],
                  name: 'my-workflow',
                  parameters: [
                    {
                      name: 'parameter',
                      testValue: 4,
                    },
                  ],
                },
              },
            },
          },
        },
        rules: [unknownWorkflowParameterRule],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('unknown workflow parameter')
    expect(problems[0].details).toEqual({ parameter: 'unknownParameter' })
  })
  test('should not fail on valid workflow parameters', () => {
    const problems = Array.from(
      searchProject({
        files: {
          components: {
            myComponent: {
              name: 'myComponent',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerWorkflow',
                          workflow: 'my-workflow',
                          parameters: {
                            parameter: {
                              formula: valueFormula(4),
                            },
                          },
                        },
                      ],
                    },
                  },
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              workflows: {
                ['my-workflow']: {
                  actions: [],
                  name: 'my-workflow',
                  parameters: [
                    {
                      name: 'parameter',
                      testValue: 4,
                    },
                  ],
                },
              },
            },
          },
        },
        rules: [unknownWorkflowParameterRule],
      }),
    )

    expect(problems).toHaveLength(0)
  })
  test('should detect unknown workflow parameters in context workflows', () => {
    const problems = Array.from(
      searchProject({
        files: {
          components: {
            myComponent: {
              name: 'myComponent',
              nodes: {
                root: {
                  type: 'component',
                  name: 'consumer',
                  attrs: {},
                  children: [],
                  events: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              workflows: {
                ['my-workflow']: {
                  actions: [],
                  name: 'my-workflow',
                  parameters: [
                    {
                      name: 'parameter',
                      testValue: 4,
                    },
                  ],
                  exposeInContext: true,
                },
              },
            },
            consumer: {
              name: 'consumer',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerWorkflow',
                          workflow: 'my-workflow',
                          contextProvider: 'bla',
                          parameters: {
                            unknownParameter: {
                              formula: valueFormula(4),
                            },
                          },
                        },
                      ],
                    },
                  },
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              contexts: {
                bla: {
                  workflows: ['my-workflow'],
                  formulas: [],
                  componentName: 'myComponent',
                },
              },
            },
          },
        },
        rules: [unknownWorkflowParameterRule],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('unknown workflow parameter')
    expect(problems[0].details).toEqual({ parameter: 'unknownParameter' })
  })
  test('should not fail on valid context workflow parameters', () => {
    const problems = Array.from(
      searchProject({
        files: {
          components: {
            myComponent: {
              name: 'myComponent',
              nodes: {
                root: {
                  type: 'component',
                  name: 'consumer',
                  attrs: {},
                  children: [],
                  events: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              workflows: {
                ['my-workflow']: {
                  actions: [],
                  name: 'my-workflow',
                  parameters: [
                    {
                      name: 'parameter',
                      testValue: 4,
                    },
                  ],
                  exposeInContext: true,
                },
              },
            },
            consumer: {
              name: 'consumer',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerWorkflow',
                          workflow: 'my-workflow',
                          contextProvider: 'bla',
                          parameters: {
                            parameter: {
                              formula: valueFormula(4),
                            },
                          },
                        },
                      ],
                    },
                  },
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              contexts: {
                bla: {
                  workflows: ['my-workflow'],
                  formulas: [],
                  componentName: 'myComponent',
                },
              },
            },
          },
        },
        rules: [unknownWorkflowParameterRule],
      }),
    )

    expect(problems).toHaveLength(0)
  })
  test('should detect unknown workflow parameters in context workflows from packages', () => {
    const problems = Array.from(
      searchProject({
        files: {
          packages: {
            myPackage: {
              manifest: {
                commit: 'commit',
                name: 'myPackage',
              },
              components: {
                myComponent: {
                  name: 'myComponent',
                  nodes: {},
                  formulas: {},
                  apis: {},
                  attributes: {},
                  variables: {},
                  workflows: {
                    ['package-workflow']: {
                      actions: [],
                      name: 'package-workflow',
                      parameters: [
                        {
                          name: 'parameter',
                          testValue: 4,
                        },
                      ],
                      exposeInContext: true,
                    },
                  },
                },
              },
            },
          },
          components: {
            consumer: {
              name: 'consumer',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerWorkflow',
                          workflow: 'package-workflow',
                          contextProvider: 'bla',
                          parameters: {
                            unknownParameter: {
                              formula: valueFormula(4),
                            },
                          },
                        },
                      ],
                    },
                  },
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              contexts: {
                bla: {
                  workflows: ['package-workflow'],
                  formulas: [],
                  componentName: 'myComponent',
                  package: 'myPackage',
                },
              },
            },
          },
        },
        rules: [unknownWorkflowParameterRule],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('unknown workflow parameter')
    expect(problems[0].details).toEqual({ parameter: 'unknownParameter' })
  })
  test('should not fail on valid package workflow parameters', () => {
    const problems = Array.from(
      searchProject({
        files: {
          packages: {
            myPackage: {
              manifest: {
                commit: 'commit',
                name: 'myPackage',
              },
              components: {
                myComponent: {
                  name: 'myComponent',
                  nodes: {},
                  formulas: {},
                  apis: {},
                  attributes: {},
                  variables: {},
                  workflows: {
                    ['package-workflow']: {
                      actions: [],
                      name: 'package-workflow',
                      parameters: [
                        {
                          name: 'parameter',
                          testValue: 4,
                        },
                      ],
                      exposeInContext: true,
                    },
                  },
                },
              },
            },
          },
          components: {
            consumer: {
              name: 'consumer',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {
                    click: {
                      trigger: 'click',
                      actions: [
                        {
                          type: 'TriggerWorkflow',
                          workflow: 'package-workflow',
                          contextProvider: 'bla',
                          parameters: {
                            parameter: {
                              formula: valueFormula(4),
                            },
                          },
                        },
                      ],
                    },
                  },
                  tag: 'div',
                  children: [],
                  style: {},
                },
              },
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              contexts: {
                bla: {
                  workflows: ['package-workflow'],
                  formulas: [],
                  componentName: 'myComponent',
                  package: 'myPackage',
                },
              },
            },
          },
        },
        rules: [unknownWorkflowParameterRule],
      }),
    )

    expect(problems).toHaveLength(0)
  })
})
