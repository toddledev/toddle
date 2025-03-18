import { valueFormula } from '@toddledev/core/dist/formula/formulaUtils'
import { searchProject } from '../searchProject'
import { duplicateRouteRule } from './duplicateRouteRule'

describe('duplicateRouteRule', () => {
  test('should detect duplicate route declarations', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {},
          components: {
            home: {
              name: 'home',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              route: {
                path: [],
                query: {},
              },
            },
            home2: {
              name: 'home2',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              route: {
                path: [],
                query: {},
              },
            },
          },
          routes: {
            home: {
              type: 'redirect',
              source: {
                path: [],
                query: {},
              },
              destination: {
                path: {},
                queryParams: {},
                url: valueFormula(''),
              },
            },
            oldBlog: {
              type: 'rewrite',
              source: {
                path: [],
                query: {},
              },
              destination: {
                path: {},
                queryParams: {},
                url: valueFormula(''),
              },
            },
          },
        },
        rules: [duplicateRouteRule],
      }),
    )

    expect(problems).toHaveLength(4)
    expect(problems[0].code).toBe('duplicate route')
    expect(problems[0].details.name).toEqual('home')
    expect(problems[0].details.duplicates).toEqual([
      { name: 'home', type: 'route' },
      { name: 'oldBlog', type: 'route' },
      { name: 'home2', type: 'page' },
    ])
    expect(problems[0].path).toEqual(['components', 'home', 'route', 'path'])
  })
  test('should detect non-basic duplicate route declarations', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {},
          components: {
            home: {
              name: 'home',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              route: {
                path: [
                  { type: 'static', name: 'blog' },
                  { type: 'param', name: 'slug', testValue: 'my-blog' },
                ],
                query: {},
              },
            },
            home2: {
              name: 'home2',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              route: {
                path: [
                  { type: 'static', name: 'blog' },
                  { type: 'param', name: 'param', testValue: 'my-blog' },
                ],
                query: {},
              },
            },
          },
        },
        rules: [duplicateRouteRule],
      }),
    )

    expect(problems).toHaveLength(2)
    expect(problems[0].code).toBe('duplicate route')
    expect(problems[0].details.name).toEqual('home')
    expect(problems[0].details.duplicates).toEqual([
      { name: 'home2', type: 'page' },
    ])
    expect(problems[0].path).toEqual(['components', 'home', 'route', 'path'])
  })
  test('should not detect unique route declarations', () => {
    const problems = Array.from(
      searchProject({
        files: {
          formulas: {},
          components: {
            home: {
              name: 'home',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              route: {
                path: [],
                query: {},
              },
            },
            home2: {
              name: 'home2',
              nodes: {},
              formulas: {},
              apis: {},
              attributes: {},
              variables: {},
              route: {
                path: [
                  {
                    name: 'blogs',
                    type: 'static',
                  },
                ],
                query: {},
              },
            },
          },
          routes: {
            unknown: {
              type: 'redirect',
              source: {
                path: [
                  {
                    name: 'unused-path',
                    type: 'static',
                  },
                ],
                query: {},
              },
              destination: {
                path: {},
                queryParams: {},
                url: valueFormula(''),
              },
            },
            oldBlog: {
              type: 'rewrite',
              source: {
                path: [
                  {
                    name: 'old-blog',
                    type: 'static',
                  },
                ],
                query: {},
              },
              destination: {
                path: {},
                queryParams: {},
                url: valueFormula(''),
              },
            },
          },
        },
        rules: [duplicateRouteRule],
      }),
    )

    expect(problems).toHaveLength(0)
  })
})
