import type {
  ProjectFiles,
  ToddleProject,
} from '@toddledev/ssr/dist/ssr.types.js'

export interface HonoEnv {
  Variables: {
    project: { files: ProjectFiles; project: ToddleProject }
  }
  Bindings: {
    template?: string
  }
}
