import type { Component } from '@toddledev/core/dist/component/component.types'
import { mapObject, omit } from '@toddledev/core/dist/utils/collections'

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
  }
}
