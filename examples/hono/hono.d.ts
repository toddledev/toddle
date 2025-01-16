import { ProjectFiles, type ToddleProject } from '@toddledev/ssr/dist/ssr.types'

export interface HonoEnv {
  Variables: {
    project: { files: ProjectFiles; project: ToddleProject }
  }
  Bindings: {
    template?: string
  }
}
