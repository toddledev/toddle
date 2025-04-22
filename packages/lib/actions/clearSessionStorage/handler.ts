import type { ActionHandler } from '@nordcraft/core/dist/types'

const handler: ActionHandler = async function () {
  window.sessionStorage.clear()
}

export default handler
