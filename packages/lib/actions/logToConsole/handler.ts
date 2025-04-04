import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = ([label, data]: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(label, data)
}

export default handler
