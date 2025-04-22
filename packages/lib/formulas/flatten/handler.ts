import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown>> = ([items]) => {
  if (Array.isArray(items)) {
    return items.flat()
  }
  // throw new Error("Argument 'Array' must be of type array")
  return null
}

export default handler
