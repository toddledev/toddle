import { NON_BODY_RESPONSE_CODES } from '@toddledev/core/dist/api/api.js'
import { REWRITE_HEADER } from '@toddledev/core/dist/utils/url.js'
import { getRouteDestination } from '@toddledev/ssr/dist/routing/routing.js'
import type { Route } from '@toddledev/ssr/dist/ssr.types.js'
import type { Context } from 'hono'
import { HonoEnv } from '../hono.js'

export const routeHandler = async (c: Context<HonoEnv>, route: Route) => {
  const destination = getRouteDestination({
    files: c.var.project.files,
    req: c.req.raw,
    route,
  })
  if (!destination) {
    return c.html(`Invalid destination`, {
      status: 500,
    })
  }
  if (route.type === 'redirect') {
    // Return a redirect to the destination with the provided status code
    return c.redirect(destination.href, route.status ?? 302)
  }

  // Rewrite handling: fetch the destination and return the response
  if (c.req.raw.headers.get(REWRITE_HEADER) !== null) {
    return c.html(`toddle rewrites are not allowed to be recursive`, {
      status: 500,
    })
  }
  try {
    const requestHeaders = new Headers()
    // Ensure this server can read the response by overriding potentially
    // unsupported accept headers from the client (brotli etc.)
    requestHeaders.set('accept-encoding', 'gzip')
    requestHeaders.set('accept', '*/*')
    // Add header to identify that this is a rewrite
    // This allows us to avoid recursive fetch calls across toddle routes
    requestHeaders.set(REWRITE_HEADER, 'true')
    const response = await fetch(destination, {
      headers: requestHeaders,
      // Routes can only be GET requests
      method: 'GET',
    })
    // Pass the stream into a new response so we can write the headers
    const body = NON_BODY_RESPONSE_CODES.includes(response.status)
      ? undefined
      : ((response.body ?? new ReadableStream()) as ReadableStream)

    const returnResponse = new Response(body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(
          [...response.headers.entries()]
            // Filter out content-encoding as it breaks decoding on the client 🤷‍♂️
            .filter(([key]) => key !== 'content-encoding'),
        ),
      },
    })
    return returnResponse
  } catch (e) {
    return c.html(
      `Internal server error when fetching url: ${destination.href}`,
      { status: 500 },
    )
  }
}
