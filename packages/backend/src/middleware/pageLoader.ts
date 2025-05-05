import { isPageComponent } from '@nordcraft/core/dist/component/isPageComponent'
import { matchPageForUrl } from '@nordcraft/ssr/dist/routing/routing'
import type { ProjectFiles } from '@nordcraft/ssr/dist/ssr.types'
import type { MiddlewareHandler } from 'hono'
import type { HonoEnv, HonoPage, HonoRoutes } from '../../hono'
import { loadJsFile } from './jsLoader'

export const pageLoader: MiddlewareHandler<
  HonoEnv<HonoRoutes & HonoPage>
> = async (ctx, next) => {
  const url = new URL(ctx.req.url)
  const page = matchPageForUrl({
    url,
    components: ctx.var.routes.pages,
  })
  if (page) {
    const pageContent = await loadJsFile<
      ProjectFiles & { customCode: boolean }
    >(`./components/${page.name}.js`)
    const component = pageContent?.components?.[page.name]
    if (!component || !isPageComponent(component)) {
      return ctx.text('Page content not found', { status: 404 })
    }
    ctx.set('page', component)
    ctx.set('files', pageContent)
    return next()
  }
  return ctx.text('Page not found', {
    status: 404,
    headers: {
      // Temporary debug header for debugging the backend's routing logic
      X_NC_DEBUG: JSON.stringify(ctx.var.routes.pages),
    },
  })
}
