import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<unknown> = ([key]) => {
  if (typeof key !== 'string' || key.length === 0) {
    // throw new Error(`Invalid key: ${key}`)
    return null
  }
  if (typeof window === 'undefined') {
    return null
  }
  const value = window.localStorage.getItem(key)
  if (value === null) {
    return value
  }
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export default handler
