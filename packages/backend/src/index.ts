import { initIsEqual } from '@nordcraft/ssr/dist/rendering/equals'
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import type { HonoEnv, HonoRoute, HonoRoutes } from '../hono'
import { pageLoader } from './middleware/pageLoader'
import { loadProjectInfo } from './middleware/projectInfo'
import { routeLoader } from './middleware/routeLoader'
import { routesLoader } from './middleware/routesLoader'
import { proxyRequestHandler } from './routes/apiProxy'
import { customElement } from './routes/customElement'
import { favicon } from './routes/favicon'
import { fontRouter } from './routes/font'
import { manifest } from './routes/manifest'
import { nordcraftPage } from './routes/nordcraftPage'
import { robots } from './routes/robots'
import { routeHandler } from './routes/routeHandler'
import { serviceWorker } from './routes/serviceWorker'
import { sitemap } from './routes/sitemap'

// Inject isEqual on globalThis
// this is currently used by some builtin formulas
initIsEqual()

const app = new Hono<HonoEnv>()

app.get('/sitemap.xml', loadProjectInfo, routesLoader, sitemap)
app.get('/robots.txt', loadProjectInfo, robots)
app.get('/manifest.json', loadProjectInfo, manifest)
app.get('/favicon.ico', loadProjectInfo, favicon)
app.get('/serviceWorker.js', loadProjectInfo, serviceWorker)

// Nordcraft specific endpoints/services on /.toddle/ subpath 👇
app.route('/.toddle/fonts', fontRouter)
// Proxy endpoint for Nordcraft APIs
app.all(
  '/.toddle/omvej/components/:componentName/apis/:apiName',
  proxyRequestHandler,
)
app.get(
  '/.toddle/custom-element/:filename{.+.js}',
  loadProjectInfo,
  customElement,
) // project infor + single component

app.get(
  '/*',
  routesLoader,
  loadProjectInfo,
  // First we try loading a route if it exists
  routeLoader,
  createMiddleware<HonoEnv<HonoRoute & HonoRoutes>>((ctx, next) => {
    const route = ctx.var.route
    if (route) {
      // Serve the route if it exists
      return routeHandler(ctx, route)
    }
    return next()
  }),
  pageLoader,
  nordcraftPage,
) // routes + single page

export default app
