import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = async function () {
  window.sessionStorage.clear()
}

export default handler
