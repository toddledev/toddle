import { initIsEqual } from '@toddledev/ssr/dist/rendering/equals'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import type { HonoEnv } from '../hono'
import { favicon } from './routes/favicon'
import { fontRouter } from './routes/font'
import { manifest } from './routes/manifest'
import { robots } from './routes/robots'
import { sitemap } from './routes/sitemap'
import { staticRouter } from './routes/static'
import { toddlePage } from './routes/toddlePage'
import { getProject } from './utils/project'

// Inject isEqual on globalThis
// this is currently used by some builtin formulas
initIsEqual()

const app = new Hono<HonoEnv>()

// Static routes don't need access to the project
app.route('/_static', staticRouter)

// Load the project onto context to make it easier to use for other routes
app.use(async (c, next) => {
  const { template } = env(c)
  const project = getProject(template)
  if (!project) {
    return c.text('Project not found', { status: 404 })
  }
  c.set('project', project)
  await next()
})

app.get('/sitemap.xml', sitemap)
app.get('/robots.txt', robots)
app.get('/manifest.json', manifest)
app.get('/favicon.ico', favicon)

// toddle specific endpoints/services on /.toddle/ subpath
app.route('.toddle/fonts', fontRouter)

// .toddle/custom-code
// .toddle/serviceWorker/...
// .toddle/omvej/...

// Treat all other requests as page requests
app.get('/*', toddlePage)

export default app
