import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown> | string> = ([list, count]) => {
  if (typeof count !== 'number') {
    // throw new Error("Argument 'Count' must be of type number")
    return null
  }
  if (Array.isArray(list)) {
    return list.slice(list.length - count)
  }
  if (typeof list === 'string') {
    return list.substring(list.length - count)
  }
  // throw new Error("Argument 'Array' must be of type array or string")
  return null
}

export default handler
