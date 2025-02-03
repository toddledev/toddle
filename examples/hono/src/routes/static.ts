import { RESET_STYLES } from '@toddledev/core/dist/styling/theme.const'
import { readFileSync } from 'fs'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { resolve } from 'path'
import type { HonoEnv } from '../../hono'

export const staticRouter = new Hono<HonoEnv, never, '/_static'>()

staticRouter.get('/reset.css', (c) => {
  c.header('Content-Type', 'text/css')
  c.header('Cache-Control', 'public, max-age=3600')
  return c.body(RESET_STYLES)
})

staticRouter.get('/esm-page.main.js', (c) => {
  c.header('Content-Type', 'text/javascript')
  c.header('Cache-Control', 'public, max-age=3600')
  // TODO: stream this file instead of reading it all into memory
  const projectData = readFileSync(
    resolve(__dirname, '../../../../packages/runtime/dist/esm-page.main.js'),
    'utf8',
  )
  return c.body(projectData)
})

staticRouter.get('/esm-page.main.js.map', (c) => {
  c.header('Content-Type', 'text/javascript')
  c.header('Cache-Control', 'public, max-age=3600')
  // TODO: stream this file instead of reading it all into memory
  const projectData = readFileSync(
    resolve(
      __dirname,
      '../../../../packages/runtime/dist/esm-page.main.js.map',
    ),
    'utf8',
  )
  return c.body(projectData)
})

// Custom elements are usually fetched from other origins,
// so we need to enable CORS
staticRouter.use(cors())
staticRouter.get('/esm-custom-element.main.js', (c) => {
  c.header('Content-Type', 'text/javascript')
  c.header('Cache-Control', 'public, max-age=3600')
  // TODO: stream this file instead of reading it all into memory
  const projectData = readFileSync(
    resolve(
      __dirname,
      '../../../../packages/runtime/dist/esm-custom-element.main.js',
    ),
    'utf8',
  )
  return c.body(projectData)
})
