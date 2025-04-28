import { createMiddleware } from 'hono/factory'
import type { HonoEnv, HonoProject } from '../../hono'
import { loadJsFile } from './jsLoader'

export const loadProjectInfo = createMiddleware<HonoEnv<HonoProject>>(
  async (ctx, next) => {
    const project = await loadJsFile<HonoProject>('./project.js')
    if (!project) {
      return ctx.text('Project configuration not found', { status: 404 })
    }
    ctx.set('project', project.project)
    ctx.set('config', project.config)
    return next()
  },
)
