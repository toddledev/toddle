import type { FormulaHandler } from '@nordcraft/core/dist/types'
const handler: FormulaHandler<boolean> = ([collection, item]) => {
  if (typeof collection === 'string' && typeof item === 'string') {
    return collection.includes(item)
  }
  if (Array.isArray(collection)) {
    return collection.some((collectionItem) =>
      (globalThis as any).toddle.isEqual(collectionItem, item),
    )
  }
  // throw new Error("Argument 'Array' must be of type array or string")
  return null
}

export default handler
