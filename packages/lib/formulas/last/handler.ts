import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<unknown> = ([list]) => {
  if (typeof list === 'string' || Array.isArray(list)) {
    return list[list.length - 1]
  }
  // throw new Error("Argument 'Array' must be of type array")
  return null
}

export default handler
