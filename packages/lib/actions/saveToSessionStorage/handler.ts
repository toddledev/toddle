import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = async function ([key, value]) {
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error(`Invalid key: ${key}`)
  }
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export default handler
