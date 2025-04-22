import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown>> = ([list]) => {
  if (Array.isArray(list)) {
    return [...list].reverse()
  }
  // throw new Error("Argument 'Array' must be of type array")
  return null
}

export default handler
