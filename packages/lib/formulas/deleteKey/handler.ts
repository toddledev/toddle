import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { isObject } from '@nordcraft/core/dist/utils/util'

const handler: FormulaHandler<Array<unknown> | Record<string, unknown>> = ([
  collection,
  key,
]) => {
  if (typeof collection !== 'object' || collection === null) {
    // throw new Error("Argument 'Object' must be of type object or array")
    return null
  }

  if (
    !Array.isArray(key) &&
    typeof key !== 'string' &&
    typeof key !== 'number'
  ) {
    // throw new Error("Argument 'Path' must be of type string, number or array")
    return null
  }

  const run = (
    collection: any,
    [key, ...path]: string[],
  ): Record<string, any> | null => {
    if (Array.isArray(collection)) {
      const index = Number(key)
      if (Number.isNaN(index)) {
        return collection
      }
      if (path.length === 0) {
        return collection.filter((_, i) => i !== Number(key))
      }
      return collection.map((e, i) =>
        i === index ? run(collection[index], path) : e,
      )
    }
    if (isObject(collection)) {
      if (path.length === 0) {
        return Object.fromEntries(
          Object.entries(collection).filter(([k]) => k !== key),
        )
      }
      return {
        ...collection,
        [key]: run(collection[key], path),
      }
    }

    return null
  }
  const path = Array.isArray(key) ? key : [key]
  return run(collection, path)
}

export default handler
