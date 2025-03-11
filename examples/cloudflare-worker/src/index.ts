import { initIsEqual } from '@toddledev/ssr/dist/rendering/equals'
import type { ProjectFiles, ToddleProject } from '@toddledev/ssr/dist/ssr.types'
import { Hono } from 'hono'
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

// Keep the project reference in memory for future requests
let project: { files: ProjectFiles; project: ToddleProject }
// Load the project onto context to make it easier to use for other routes
app.use(async (c, next) => {
  if (!project) {
    const path = `./project.json`
    try {
      const content = await import(path)
      project = JSON.parse(content.default) as {
        files: ProjectFiles
        project: ToddleProject
      }
    } catch (e) {
      console.error(
        'Unable to load project.json',
        e instanceof Error ? e.message : e,
      )
    }
    if (!project) {
      return c.text('Project not found', { status: 404 })
    }
  }
  c.set('project', project)
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
