import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<unknown> = ([list]) => {
  if (typeof list === 'string' || Array.isArray(list)) {
    return list[0]
  }
  // throw new Error("Argument 'Array' must be of type array or string")
  return null
}

export default handler
