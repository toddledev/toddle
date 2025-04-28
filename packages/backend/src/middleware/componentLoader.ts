import type { ProjectFiles } from '@toddledev/ssr/dist/ssr.types'
import type { MiddlewareHandler } from 'hono'
import type { HonoComponent, HonoEnv } from '../../hono'
import { loadJsFile } from './jsLoader'

export const componentLoader =
  (name: string): MiddlewareHandler<HonoEnv<HonoComponent>> =>
  async (ctx, next) => {
    const componentFile = await loadJsFile<
      ProjectFiles & { customCode: boolean }
    >(`./components/${name}.js`)
    const component = componentFile?.components?.[name]
    if (!component) {
      return ctx.text('Component not found', { status: 404 })
    }
    ctx.set('component', component)
    ctx.set('files', componentFile)
    return next()
  }
