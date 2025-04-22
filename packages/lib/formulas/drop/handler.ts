import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown> | string> = ([list, count]) => {
  if (typeof count !== 'number' || isNaN(count)) {
    // throw new Error("Argument 'Count' must be of type number")
    return null
  }
  if (Array.isArray(list)) {
    return list.slice(count)
  }
  if (typeof list === 'string') {
    return list.substring(count)
  }
  // throw new Error('Argument Array must be of type array or list')
  return null
}

export default handler
