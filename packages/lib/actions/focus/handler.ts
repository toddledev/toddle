import type { ActionHandler } from '@nordcraft/core/dist/types'

const handler: ActionHandler = ([elem]) => {
  if (elem instanceof HTMLElement) {
    elem.focus()
  }
}

export default handler
