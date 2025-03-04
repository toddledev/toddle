import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = async function () {
  window.localStorage.clear()
}

export default handler
