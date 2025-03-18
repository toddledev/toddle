import type { RouteDeclaration } from '@toddledev/core/dist/component/component.types'
import { isPageComponent } from '@toddledev/core/dist/component/isPageComponent'
import type { Rule } from '../types'

export const duplicateRouteRule: Rule<{
  name: string
  duplicates: Array<{ name: string; type: 'route' | 'page' }>
}> = {
  code: 'duplicate route',
  level: 'warning',
  category: 'Quality',
  visit: (report, args) => {
    const { nodeType, value, files, memo, path } = args
    if (
      (nodeType !== 'component' || !isPageComponent(value)) &&
      nodeType !== 'project-route'
    ) {
      return
    }
    const getRouteKey = (route: RouteDeclaration['path']) =>
      route.reduce(
        (acc, part) => `${acc}/${part.type === 'static' ? part.name : '*'}`,
        '/',
      )
    const allRoutes = memo('allRoutes', () => {
      const routes = new Map<
        string,
        Array<{ name: string; type: 'route' | 'page' }>
      >()
      Object.entries(files.routes ?? {}).map(([route, routeValue]) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (routeValue.source) {
          const key = getRouteKey(routeValue.source.path)
          const existing = routes.get(key)
          if (existing) {
            existing.push({ name: route, type: 'route' })
          } else {
            routes.set(key, [{ name: route, type: 'route' }])
          }
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      Object.entries(files.components ?? {}).map(
        ([component, componentValue]) => {
          if (componentValue && isPageComponent(componentValue)) {
            const key = getRouteKey(componentValue.route.path)
            const existing = routes.get(key)
            if (existing) {
              existing.push({ name: component, type: 'page' })
            } else {
              routes.set(key, [{ name: component, type: 'page' }])
            }
          }
        },
      )
      return routes
    })
    if (nodeType === 'project-route') {
      const match = allRoutes.get(getRouteKey(value.source.path))
      if (match && match.length > 1) {
        report([...path, 'source', 'path'], {
          name: args.routeName,
          duplicates: match.filter(
            (m) => m.name !== args.routeName || m.type === 'page',
          ),
        })
      }
    } else if (isPageComponent(value)) {
      const match = allRoutes.get(getRouteKey(value.route?.path))
      if (match && match.length > 1) {
        report([...path, 'route', 'path'], {
          name: value.name,
          duplicates: match.filter(
            (m) => m.name !== value.name || m.type === 'route',
          ),
        })
      }
    }
  },
}
