import {
  PageComponent,
  PageRoute,
} from '@toddledev/core/dist/component/component.types'
import { applyFormula } from '@toddledev/core/dist/formula/formula'
import { validateUrl } from '@toddledev/core/dist/utils/url'
import { isDefined } from '@toddledev/core/dist/utils/util'
import {
  getDataUrlParameters,
  getServerToddleObject,
} from '../rendering/formulaContext'
import { ProjectFiles, Route } from '../ssr.types'

export const matchPageForUrl = ({
  url,
  components,
}: {
  url: URL
  components: ProjectFiles['components']
}) =>
  matchRoutes({
    url,
    entries: getPages(components),
    getRoute: (route) => route.route,
  })

export const matchRouteForUrl = ({
  url,
  routes,
}: {
  url: URL
  routes: ProjectFiles['routes']
}) =>
  matchRoutes({
    url,
    entries: Object.values(routes ?? {}),
    getRoute: (route) => route.source,
  })

export const matchRoutes = <T>({
  url,
  entries,
  getRoute,
}: {
  url: URL
  entries: T[]
  getRoute: (entry: T) => Pick<PageRoute, 'path' | 'query'>
}): T | undefined => {
  const pathSegments = getPathSegments(url)
  const matches = Object.values(entries)
    .filter((entry) => {
      const route = getRoute(entry)
      return (
        pathSegments.length <= route.path.length &&
        route.path.every(
          (segment, index) =>
            segment.type === 'param' ||
            segment.optional === true ||
            segment.name === pathSegments[index],
        )
      )
    })
    .sort((a, b) => {
      const routeA = getRoute(a)
      const routeB = getRoute(b)
      // Prefer shorter routes
      const diff = routeA.path.length - routeB.path.length
      if (diff !== 0) {
        return diff
      }
      for (let i = 0; i < pathSegments.length; i++) {
        // Prefer static segments over dynamic ones
        // We don't need to check if the name matches, since we did that in the filter above
        const aScore = routeA.path[i].type === 'static' ? 1 : 0
        const bScore = routeB.path[i].type === 'static' ? 1 : 0
        if (aScore !== bScore) {
          return bScore - aScore
        }
      }
      // TODO: Before giving up on a tie, we could compare the query params?
      return 0
    })
  return matches[0]
}

export const getRouteDestination = ({
  files,
  req,
  route,
}: {
  files: ProjectFiles
  req: Request
  route: Route
}) => {
  return validateUrl(
    applyFormula(
      route.destination.formula,
      // destination formulas should only have access to URL parameters from
      // the route's source definition. Not from anything else atm.
      {
        data: {
          'URL parameters': getDataUrlParameters({
            route: route.source,
            req,
          }),
        },
        toddle: getServerToddleObject(files),
      } as any,
    ),
  )
}

export const get404Page = (components: ProjectFiles['components']) =>
  getPages(components).find((page) => page.name === '404')

const getPages = (components: ProjectFiles['components']) =>
  Object.values(components).filter((c): c is PageComponent =>
    isDefined(c!.route),
  )

export const getPathSegments = (url: URL) =>
  url.pathname
    .substring(1)
    .split('/')
    .filter((s) => s !== '')
