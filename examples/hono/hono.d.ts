import type { ProjectFiles, ToddleProject } from '@nordcraft/ssr/dist/ssr.types'

export interface HonoEnv {
  Variables: {
    project: { files: ProjectFiles; project: ToddleProject }
  }
  Bindings: {
    template?: string
  }
}
