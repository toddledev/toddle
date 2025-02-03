import { applyFormula } from '@toddledev/core/dist/formula/formula'
import { validateUrl } from '@toddledev/core/dist/utils/url'
import { isDefined } from '@toddledev/core/dist/utils/util'
import type { Context } from 'hono'
import { stream } from 'hono/streaming'
import type { HonoEnv } from '../../hono'

export const serviceWorker = async (c: Context<HonoEnv>) => {
  try {
    const config = c.var.project.files.config
    const serviceWorkerUrl = isDefined(config?.meta?.serviceWorker)
      ? // We don't need to provide a context for applyFormula, as the formula should just be a value formula
        applyFormula(config.meta.serviceWorker.formula, undefined as any)
      : undefined
    const url = validateUrl(serviceWorkerUrl)
    if (url) {
      // return a (streamed) response with the body from the service worker
      const { body, ok } = await fetch(url)
      if (ok && body) {
        c.header('Content-Type', 'text/javascript')
        return stream(c, (s) => s.pipe(body as any))
      }
    }
    return new Response(null, { status: 404 })
  } catch (e) {
    console.error(e)
  }
  return new Response(null, { status: 404 })
}
