import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([collection, item]) => {
  if (typeof collection === 'string') {
    return collection.indexOf(item as any)
  }

  if (Array.isArray(collection)) {
    return collection.findIndex((i) =>
      (globalThis as any).toddle.isEqual(i, item),
    )
  }
  // throw new Error("Argument 'Array' must be of type array or string")
  return null
}

export default handler
