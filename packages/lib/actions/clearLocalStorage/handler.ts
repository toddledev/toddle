import type { ActionHandler } from '@nordcraft/core/dist/types'

const handler: ActionHandler = async function () {
  window.localStorage.clear()
}

export default handler
