import { matchRouteForUrl } from '@toddledev/ssr/dist/routing/routing'
import type { Route } from '@toddledev/ssr/dist/ssr.types'
import { createMiddleware } from 'hono/factory'
import type { HonoEnv, HonoRoute, HonoRoutes } from '../../hono'

const routes: Partial<Record<string, Route>> = {}

export const routeLoader = createMiddleware<HonoEnv<HonoRoutes & HonoRoute>>(
  async (ctx, next) => {
    const url = new URL(ctx.req.url)
    let route: Route | undefined = routes[url.pathname]
    if (route) {
      ctx.set('route', route)
      routes[url.pathname] = route
      return next()
    }
    route = matchRouteForUrl({
      url,
      routes: ctx.var.routes?.routes ?? {},
    })
    if (!route) {
      return next()
    }
    routes[url.pathname] = route
    ctx.set('route', route)
    return next()
  },
)
