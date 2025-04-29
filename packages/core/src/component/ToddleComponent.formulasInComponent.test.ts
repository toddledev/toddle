import { functionFormula, valueFormula } from '../formula/formulaUtils'
import { ToddleComponent } from './ToddleComponent'

describe('ToddleComponent.formulasInComponent', () => {
  test('it return formulas used in parameters of TriggerWorkflow actions', () => {
    const demo = new ToddleComponent({
      component: {
        name: 'demo',
        apis: {},
        attributes: {},
        nodes: {},
        variables: {},
        workflows: {
          '7XLoA3': {
            name: 'my-workflow',
            actions: [
              {
                type: 'TriggerWorkflow',
                workflow: 'jm3yUN',
                parameters: {
                  'param-1': {
                    formula: {
                      name: 'scrollPosition',
                      type: 'function',
                      arguments: [],
                    },
                  },
                },
              },
            ],
            parameters: [],
          },
        },
      },
      getComponent: () => undefined,
      packageName: 'demo',
      globalFormulas: { formulas: {}, packages: {} },
    })
    const formulas = Array.from(demo.formulasInComponent()).map(
      ({ formula }) => formula,
    )
    expect(formulas).toContainEqual({
      name: 'scrollPosition',
      type: 'function',
      arguments: [],
    })
  })
  test('it returns formulas used in APIs', () => {
    const demo = new ToddleComponent({
      component: {
        name: 'demo',
        apis: {
          legacyApi: {
            name: 'legacyAPI',
            type: 'REST',
            url: valueFormula('https://api.example.com'),
            autoFetch: {
              type: 'function',
              name: 'customFunction',
              arguments: [],
            },
            onCompleted: null,
            onFailed: null,
          },
          v2Api: {
            name: 'v2API',
            type: 'http',
            version: 2,
            url: valueFormula('https://api.example.com'),
            autoFetch: {
              type: 'function',
              name: 'otherFunction',
              arguments: [],
            },
            client: {
              parserMode: 'auto',
              onCompleted: null,
              onFailed: null,
            },
            inputs: {},
          },
        },
        attributes: {},
        nodes: {},
        variables: {},
        workflows: {},
      },
      getComponent: () => undefined,
      packageName: undefined,
      globalFormulas: { formulas: {}, packages: {} },
    })
    const formulas = Array.from(demo.formulasInComponent()).map(
      ({ formula }) => formula,
    )
    expect(formulas).toContainEqual({
      name: 'customFunction',
      type: 'function',
      arguments: [],
    })
    expect(formulas).toContainEqual({
      name: 'otherFunction',
      type: 'function',
      arguments: [],
    })
  })
  test('it returns global formulas', () => {
    const demo = new ToddleComponent({
      component: {
        name: 'demo',
        apis: {},
        attributes: {},
        nodes: {},
        variables: {
          x: {
            initialValue: functionFormula('globalFunction'),
          },
        },
        workflows: {},
      },
      getComponent: () => undefined,
      packageName: undefined,
      globalFormulas: {
        formulas: {
          globalFunction: {
            name: 'globalFunction',
            arguments: [],
            formula: valueFormula(4),
          },
        },
        packages: {},
      },
    })
    const formulas = Array.from(demo.formulasInComponent()).map(
      ({ formula }) => formula,
    )
    expect(formulas).toContainEqual({
      name: 'globalFunction',
      type: 'function',
      arguments: [],
    })
  })
  test('it returns global formulas that are referenced through global formulas', () => {
    const demo = new ToddleComponent({
      component: {
        name: 'demo',
        apis: {},
        attributes: {},
        nodes: {},
        variables: {
          x: {
            initialValue: functionFormula('globalFunction'),
          },
        },
        workflows: {},
      },
      getComponent: () => undefined,
      packageName: undefined,
      globalFormulas: {
        formulas: {
          globalFunction: {
            name: 'globalFunction',
            arguments: [],
            formula: functionFormula('otherGlobalFunction'),
          },
          otherGlobalFunction: {
            name: 'otherGlobalFunction',
            arguments: [],
            formula: valueFormula(4),
          },
        },
        packages: {},
      },
    })
    const formulas = Array.from(demo.formulasInComponent()).map(
      ({ formula }) => formula,
    )
    expect(formulas).toContainEqual({
      name: 'globalFunction',
      type: 'function',
      arguments: [],
    })
    expect(formulas).toContainEqual({
      name: 'otherGlobalFunction',
      type: 'function',
      arguments: [],
    })
  })
  test("it stops following function refs after they've been visited once (no infinite loops)", () => {
    const demo = new ToddleComponent({
      component: {
        name: 'demo',
        apis: {},
        attributes: {},
        nodes: {},
        variables: {
          x: {
            initialValue: functionFormula('globalFunction'),
          },
        },
        workflows: {},
      },
      getComponent: () => undefined,
      packageName: undefined,
      globalFormulas: {
        formulas: {
          globalFunction: {
            name: 'globalFunction',
            arguments: [],
            formula: functionFormula('otherGlobalFunction'),
          },
          otherGlobalFunction: {
            name: 'otherGlobalFunction',
            arguments: [],
            formula: functionFormula('globalFunction'),
          },
        },
        packages: {},
      },
    })
    const formulas = Array.from(demo.formulasInComponent()).map(
      ({ formula }) => formula,
    )
    expect(formulas).toContainEqual({
      name: 'globalFunction',
      type: 'function',
      arguments: [],
    })
    expect(formulas).toContainEqual({
      name: 'otherGlobalFunction',
      type: 'function',
      arguments: [],
    })
  })
})
