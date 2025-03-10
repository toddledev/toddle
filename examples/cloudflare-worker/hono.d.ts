import type { ProjectFiles, ToddleProject } from '@toddledev/ssr/dist/ssr.types'

export interface HonoEnv {
  Variables: {
    project: { files: ProjectFiles; project: ToddleProject }
  }
}
