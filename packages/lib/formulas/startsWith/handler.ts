import type { FormulaHandler } from '@nordcraft/core/dist/types'
const handler: FormulaHandler<boolean> = ([collection, prefix]) => {
  if (typeof collection !== 'string') {
    // throw new Error("Argument 'String' must be of type string")
    return null
  }
  if (typeof prefix !== 'string') {
    // throw new Error("Argument 'Prefix' must be of type string")
    return null
  }

  return collection.startsWith(prefix)
}

export default handler
