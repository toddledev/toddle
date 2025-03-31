import { valueFormula } from '@toddledev/core/dist/formula/formulaUtils'
import { removeTestData } from './testData'

describe('removeTestData', () => {
  test('it removes testValue from attributes', () => {
    expect(
      removeTestData({
        name: 'test',
        variables: {},
        apis: {},
        nodes: {},
        attributes: {
          '1': {
            name: 'foo',
            testValue: 'bar',
          },
        },
      }).attributes,
    ).toEqual({
      '1': {
        name: 'foo',
      },
    })
  })
  test('it removes testValue from route parameters', () => {
    expect(
      removeTestData({
        name: 'test',
        variables: {},
        apis: {},
        nodes: {},
        attributes: {},
        route: {
          path: [
            {
              name: 'blog',
              type: 'static',
            },
            {
              name: 'slug',
              type: 'param',
              testValue: '123',
            },
          ],
          query: {
            q: {
              name: 'q',
              testValue: '123',
            },
          },
        },
      }).route,
    ).toEqual({
      path: [
        {
          name: 'blog',
          type: 'static',
        },
        {
          name: 'slug',
          type: 'param',
        },
      ],
      query: {
        q: {
          name: 'q',
        },
      },
    })
  })
  test('it removes testValue from formula arguments', () => {
    expect(
      removeTestData({
        name: 'test',
        variables: {},
        apis: {},
        nodes: {},
        attributes: {},
        formulas: {
          a: {
            name: 'foo',
            arguments: [
              {
                name: 'bar',
                testValue: 'baz',
              },
            ],
            formula: valueFormula(true),
          },
        },
      }).formulas?.['a']?.arguments,
    ).toEqual([
      {
        name: 'bar',
      },
    ])
  })
  test('it removes testValue from workflow parameters', () => {
    expect(
      removeTestData({
        name: 'test',
        variables: {},
        apis: {},
        nodes: {},
        attributes: {},
        workflows: {
          p: {
            name: 'foo',
            parameters: [
              {
                name: 'bar',
                testValue: 'baz',
              },
            ],
            actions: [],
          },
        },
      }).workflows?.['p']?.parameters,
    ).toEqual([
      {
        name: 'bar',
      },
    ])
  })
  test('it removes description from workflow actions', () => {
    expect(
      removeTestData({
        name: 'test',
        variables: {},
        apis: {},
        nodes: {},
        attributes: {},
        workflows: {
          p: {
            name: 'foo',
            parameters: [
              {
                name: 'bar',
                testValue: 'baz',
              },
            ],
            actions: [
              {
                type: 'Custom',
                description: 'A long description',
                name: 'My Action',
              },
            ],
          },
        },
      }).workflows?.['p']?.actions,
    ).toEqual([
      {
        type: 'Custom',
        name: 'My Action',
      },
    ])
  })
  test('it removes service refs from APIs', () => {
    expect(
      removeTestData({
        name: 'test',
        variables: {},
        nodes: {},
        attributes: {},
        apis: {
          a: {
            name: 'foo',
            service: 'bar',
            servicePath: 'baz',
            url: valueFormula('https://example.com'),
            version: 2,
            type: 'http',
            inputs: {},
          },
        },
      }).apis['a'],
    ).toEqual({
      name: 'foo',
      url: valueFormula('https://example.com'),
      version: 2,
      type: 'http',
      inputs: {},
    })
  })
})
