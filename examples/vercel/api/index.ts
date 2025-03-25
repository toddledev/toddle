import { initIsEqual } from '@toddledev/ssr/dist/rendering/equals.js'
import { ProjectFiles, ToddleProject } from '@toddledev/ssr/dist/ssr.types.js'
import { promises as fs } from 'fs'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { HonoEnv } from '../src/hono.js'
import { customCode } from '../src/routes/customCode.js'
import { favicon } from '../src/routes/favicon.js'
import { fontRouter } from '../src/routes/font.js'
import { manifest } from '../src/routes/manifest.js'
import { robots } from '../src/routes/robots.js'
import { serviceWorker } from '../src/routes/serviceWorker.js'
import { sitemap } from '../src/routes/sitemap.js'
import { toddlePage } from '../src/routes/toddlePage.js'

export const runtime = 'nodejs'

// Inject isEqual on globalThis
// this is currently used by some builtin formulas
initIsEqual()

const app = new Hono<HonoEnv>()

// Keep the project reference in memory for future requests
let project: { files: ProjectFiles; project: ToddleProject }
// Load the project onto context to make it easier to use for other routes
app.use(async (c, next) => {
  if (!project) {
    const file = await fs.readFile(process.cwd() + '/project.json', 'utf8')
    project = JSON.parse(file)
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
app.get('/.toddle/custom-code.js', customCode)
// app.all(
//   '/.toddle/omvej/components/:componentName/apis/:apiName',
//   proxyRequestHandler,
// )
// app.get('/.toddle/custom-element/:filename{.+.js}', customElement)

app.get('/*', toddlePage)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
export const HEAD = handle(app)
export const OPTIONS = handle(app)
