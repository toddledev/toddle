import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = async function ([key]) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error(`Invalid key: ${key}`)
  }
  window.localStorage.removeItem(key)
}

export default handler
