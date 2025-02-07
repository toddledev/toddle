import { ToddleComponent } from './ToddleComponent'

describe('ToddleComponent.actionReferences', () => {
  test('it return custom actions used in the component', () => {
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
                type: 'Custom',
                name: 'MyCustomAction',
              },
              {
                name: 'MyLegacyCustomAction',
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
    const actions = Array.from(demo.actionReferences)
    expect(actions).toEqual(['MyCustomAction', 'MyLegacyCustomAction'])
  })
  test('it should not include non-custom actions', () => {
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
                type: 'SetVariable',
                data: {
                  type: 'value',
                  value: 'Hello World',
                },
                variable: 'my-variable',
              },
              {
                type: 'TriggerEvent',
                event: 'my-event',
                data: {
                  type: 'value',
                  value: 'Hello World',
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
    const actions = Array.from(demo.actionReferences)
    expect(actions).toEqual([])
  })
})
