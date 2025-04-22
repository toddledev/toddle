import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([list, separator]) => {
  if (Array.isArray(list)) {
    return list.join(String(separator))
  }
  // throw new Error("Argument 'Array' must be of type array")
  return null
}

export default handler
