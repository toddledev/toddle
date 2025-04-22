import type { ActionHandler } from '@nordcraft/core/dist/types'

const handler: ActionHandler = (_, _ctx, event) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  event?.stopPropagation?.()
}

export default handler
