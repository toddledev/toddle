import type { ProjectFiles } from '@toddledev/ssr/dist/ssr.types'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export const getProject = (projectFile = 'small') => {
  try {
    const projectData = readFileSync(
      resolve(__dirname, `../../../projects/${projectFile}.json`),
      'utf8',
    )
    const project = JSON.parse(projectData) as { files: ProjectFiles }
    return project
  } catch (e) {
    console.error(e)
  }
}