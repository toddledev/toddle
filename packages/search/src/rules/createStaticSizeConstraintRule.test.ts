import { searchProject } from '../searchProject'
import { createStaticSizeConstraintRule } from './createStaticSizeConstraintRule'

describe('createStaticSizeConstraintRule', () => {
  test.only('should calculate element size correctly', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {},
          components: {
            test: {
              name: 'test',
              nodes: {
                root: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {},
                  tag: 'img',
                  children: ['svg'],
                  style: {},
                },
                svg: {
                  type: 'element',
                  attrs: {},
                  classes: {},
                  events: {},
                  tag: 'svg',
                  children: ['elem'],
                  style: {},
                },
                elem: {
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
        rules: [createStaticSizeConstraintRule('svg', 1)],
      }),
    )

    expect(problems).toHaveLength(1)
    expect(problems[0].code).toBe('size constraint')
    expect(problems[0].path).toEqual(['components', 'test', 'nodes', 'svg'])
    const expectedSize = new Blob(['<svg><div></div></svg>']).size
    expect(problems[0].details.size).toEqual(expectedSize)
  })
})
