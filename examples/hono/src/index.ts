import { serveStatic } from '@hono/node-server/serve-static'
import { initIsEqual } from '@nordcraft/ssr/dist/rendering/equals'
import type { ProjectFiles, ToddleProject } from '@nordcraft/ssr/dist/ssr.types'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import type { HonoEnv } from '../hono'
import { proxyRequestHandler } from './routes/apiProxy'
import { customCode } from './routes/customCode'
import { customElement } from './routes/customElement'
import { favicon } from './routes/favicon'
import { fontRouter } from './routes/font'
import { manifest } from './routes/manifest'
import { robots } from './routes/robots'
import { serviceWorker } from './routes/serviceWorker'
import { sitemap } from './routes/sitemap'
import { stylesheetHandler } from './routes/stylesheetHandler'
import { toddlePage } from './routes/toddlePage'

// Inject isEqual on globalThis
// this is currently used by some builtin formulas
initIsEqual()

const app = new Hono<HonoEnv>()

// Allow accessing static assets (reset stylesheet + page/custom element runtime)
app.use(
  '/_static/*',
  // See https://hono.dev/docs/getting-started/nodejs#serve-static-files
  serveStatic({
    root: './assets',
  }),
)

// Keep the project reference in memory for future requests
let project: { files: ProjectFiles; project: ToddleProject }
// Load the project onto context to make it easier to use for other routes
app.use(async (c, next) => {
  const { template } = env(c)
  if (!project) {
    project = await import(`../../projects/${template ?? 'small'}.json`)
    if (!project) {
      return c.text('Project not found', { status: 404 })
    }
  }
  c.set('project', project as { files: ProjectFiles; project: ToddleProject })
  return next()
})

app.get('/sitemap.xml', sitemap)
app.get('/robots.txt', robots)
app.get('/manifest.json', manifest)
app.get('/favicon.ico', favicon)
app.get('/serviceWorker.js', serviceWorker)

// toddle specific endpoints/services on /.toddle/ subpath 👇
app.route('/.toddle/fonts', fontRouter)
app.get('/.toddle/stylesheet/:pageName{.+.css}', stylesheetHandler)
app.get('/.toddle/custom-code.js', customCode)
app.all(
  '/.toddle/omvej/components/:componentName/apis/:apiName',
  proxyRequestHandler,
)
app.get('/.toddle/custom-element/:filename{.+.js}', customElement)

// Treat all other requests as page requests
app.get('/*', toddlePage)

export default app
