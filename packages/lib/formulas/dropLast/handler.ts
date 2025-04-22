import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown> | string> = ([list, count]) => {
  if (typeof count !== 'number' || isNaN(count)) {
    // throw new Error('Argument Count must be of type number')
    return null
  }
  if (Array.isArray(list)) {
    return list.slice(0, list.length - count)
  }
  if (typeof list === 'string') {
    return list.substring(0, list.length - count)
  }
  // throw new Error('Argument Array must be of type array or String')
  return null
}

export default handler
