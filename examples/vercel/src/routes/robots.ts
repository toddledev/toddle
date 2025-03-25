import { applyFormula } from '@toddledev/core/dist/formula/formula.js'
import { validateUrl } from '@toddledev/core/dist/utils/url.js'
import type { Context } from 'hono'
import { stream } from 'hono/streaming'
import { HonoEnv } from '../hono.js'

const ROBOTS_CONTENT_TYPE = 'text/plain'

export const robots = async (c: Context<HonoEnv>) => {
  try {
    const robots = c.var.project.files.config?.meta?.robots
    // we don't provide a context below, as the formula should just be a value formula
    const robotsUrl = applyFormula(robots?.formula, undefined as any)
    const validatedRobotsUrl = validateUrl(robotsUrl)
    if (validatedRobotsUrl) {
      // return a (streamed) response with the body from robots.txt
      const { body, ok } = await fetch(validatedRobotsUrl)
      if (ok && body) {
        c.header('Content-Type', ROBOTS_CONTENT_TYPE)
        c.header('Cache-Control', 'public, max-age=3600')
        return stream(c, (s) => s.pipe(body as any))
      }
    }
    // Provide a fallback robots.txt response
    const url = new URL(c.req.url)
    const content = `\
Sitemap: ${url.origin}/sitemap.xml

User-agent: *
Disallow: /_toddle
Disallow: /_toddle/
Disallow: /.toddle
Disallow: /.toddle/
Disallow: /_api
Disallow: /_api/
Allow: /cdn-cgi/imagedelivery/*
Disallow: /cdn-cgi/
`
    return new Response(content, {
      headers: {
        'Content-Type': ROBOTS_CONTENT_TYPE,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error(e)
  }
  return new Response('404', { status: 404 })
}
