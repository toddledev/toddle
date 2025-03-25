import { NON_BODY_RESPONSE_CODES } from '@toddledev/core/dist/api/api.js'
import {
  PROXY_URL_HEADER,
  validateUrl,
} from '@toddledev/core/dist/utils/url.js'
import { getRequestCookies } from '@toddledev/ssr/dist/rendering/cookies.js'
import {
  applyTemplateValues,
  sanitizeProxyHeaders,
} from '@toddledev/ssr/dist/rendering/template.js'
import type { Context } from 'hono'
import { HonoEnv } from '../hono.js'

export const proxyRequestHandler = async (
  c: Context<HonoEnv, '/.toddle/omvej/components/:componentName/apis/:apiName'>,
): Promise<Response> => {
  const req = c.req.raw
  const requestCookies = getRequestCookies(req)
  const outgoingRequestUrl = validateUrl(
    // Replace potential cookie values in the URL
    applyTemplateValues(req.headers.get(PROXY_URL_HEADER), requestCookies),
  )
  if (!outgoingRequestUrl) {
    return c.json(
      {
        error: `The provided URL is invalid: ${req.headers.get(
          PROXY_URL_HEADER,
        )}`,
      },
      { status: 400 },
    )
  }
  let headers: Headers
  try {
    headers = sanitizeProxyHeaders({
      cookies: requestCookies,
      headers: req.headers,
    })
  } catch {
    return c.json(
      {
        error:
          'Proxy validation failed: one or more headers had an invalid name/value',
      },
      { status: 400 },
    )
  }
  try {
    const request = new Request(outgoingRequestUrl.href, {
      // We copy over the method
      method: c.req.method,
      headers,
      // We forward the body
      body: req.body,
      // Let's add a 5s timeout
      signal: AbortSignal.timeout(5000),
    })
    let response: Response
    try {
      response = await fetch(request)
    } catch (e: any) {
      console.log('API request error', e.message)
      const status = e instanceof Error && e.name === 'TimeoutError' ? 504 : 500
      response = new Response(e.message, {
        status,
        headers: { 'content-type': 'application/json' },
      })
    }

    // Pass the stream into a new response so we can write the headers
    const body = NON_BODY_RESPONSE_CODES.includes(response.status)
      ? undefined
      : ((response.body ?? new ReadableStream()) as ReadableStream)

    const returnResponse = new Response(body, {
      status: response.status,
      headers: Object.fromEntries(response.headers),
    })
    return returnResponse
  } catch (e) {
    const error =
      e instanceof Error
        ? e.message
        : 'Unable to build a valid request from the API definition'
    return c.json({ error }, { status: 500 })
  }
}
