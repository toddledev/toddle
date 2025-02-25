import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = ([label, data]: unknown[]) => {
  console.log(label, data)
}

export default handler
