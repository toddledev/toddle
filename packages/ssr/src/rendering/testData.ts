import { isLegacyApi } from '@toddledev/core/dist/api/api'
import type { Component } from '@toddledev/core/dist/component/component.types'
import {
  mapObject,
  omit,
  omitKeys,
} from '@toddledev/core/dist/utils/collections'

export function removeTestData(component: Component): Component {
  return {
    ...component,
    attributes: mapObject(component.attributes, ([key, value]) => [
      key,
      omit(value, ['testValue']),
    ]),
    ...(component.route
      ? {
          route: {
            ...component.route,
            path: component.route.path.map((p) => omit(p, ['testValue'])),
            query: mapObject(component.route.query, ([key, value]) => [
              key,
              omit(value, ['testValue']),
            ]),
          },
        }
      : {}),
    ...(component.formulas
      ? {
          formulas: mapObject(component.formulas, ([key, value]) => [
            key,
            {
              ...value,
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              arguments: (value.arguments || []).map((a) =>
                omit(a, ['testValue']),
              ),
            },
          ]),
        }
      : {}),
    ...(component.workflows
      ? {
          workflows: mapObject(component.workflows, ([key, value]) => [
            key,
            {
              ...value,
              // We should find all actions (also nested actions and non-workflow actions) and remove
              // the description from them. This is a start though
              actions: value.actions.map((a) =>
                a.type === 'Custom' ? omitKeys(a, ['description']) : a,
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              parameters: (value.parameters || []).map((p) =>
                omit(p, ['testValue']),
              ),
            },
          ]),
        }
      : {}),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    apis: mapObject(component.apis ?? {}, ([key, api]) => [
      key,
      // service and servicePath are only necessary in the editor. All information about an API
      // request is available on the api object itself
      isLegacyApi(api) ? api : omitKeys(api, ['service', 'servicePath']),
    ]),
  }
}
