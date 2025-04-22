import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Record<string, unknown>> = ([list]) => {
  if (Array.isArray(list)) {
    const object: Record<string, any> = {}
    for (const { key, value } of list) {
      object[key] = value
    }
    return object
  }
  // throw new Error("Argument 'Array' must be of type array")
  return null
}

export default handler
