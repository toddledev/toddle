import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([value]) => {
  switch (typeof value) {
    case 'number':
      if (isNaN(value)) {
        return null
      }
      return 'Number'
    case 'string':
      return 'String'
    case 'boolean':
      return 'Boolean'
    case 'object':
      return Array.isArray(value) ? 'Array' : value === null ? 'Null' : 'Object'

    case 'undefined':
      return 'Null'
    default:
      // throw new Error("Could not determine the type of the argument 'Input'")
      return null
  }
}

export default handler
