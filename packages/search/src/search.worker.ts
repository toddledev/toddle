import type { ProjectFiles } from '@nordcraft/ssr/dist/ssr.types'

type Query =
  | {
      type: 'freeform'
      value: string
    }
  | {
      type: 'component'
      name: string
      references?: boolean
    }
  | {
      type: 'formula'
      name: string
      references?: boolean
    }
  | {
      type: 'action'
      name: string
      references?: boolean
    }

export interface Options {
  /**
   * Useful for running search on a subset or a single file.
   */
  pathsToVisit?: string[][]
  /**
   * The number of reports to send per message.
   * @default 1
   */
  batchSize?: number | 'all' | 'per-file'
}

/**
 * Similar to problems with using rules and returning paths, but for searching the toddle file format instead of searching for problems.
 *
 * Great for finding freeform text anywhere in a project, or references, dependencies etc.
 */
onmessage = (
  _event: MessageEvent<{
    files: ProjectFiles
    query: Query
    options?: unknown
  }>,
) => {
  throw new Error('Not yet implemented')
}
