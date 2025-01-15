import type { ToddleProject } from '@toddledev/ssr/dist/ssr.types'
import { ProjectFiles } from '@toddledev/ssr/dist/ssr.types'

export interface HonoEnv {
  Variables: {
    project: { files: ProjectFiles; project: ToddleProject }
  }
  Bindings: {
    template?: string
  }
}
