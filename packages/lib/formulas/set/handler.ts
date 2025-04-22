import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { isObject } from '@nordcraft/core/dist/utils/util'

const handler: FormulaHandler<Array<unknown> | Record<string, unknown>> = (
  [collection, key, value],
  ctx,
): any => {
  if (
    typeof key !== 'string' &&
    typeof key !== 'number' &&
    !Array.isArray(key)
  ) {
    // throw new Error("Argument 'Path' must be of type array, string or number")
    return null
  }
  const [head, ...rest] = Array.isArray(key) ? key : [key]
  if (isObject(collection)) {
    const clone: Record<string, any> = Array.isArray(collection)
      ? [...collection]
      : { ...collection }
    clone[head] =
      rest.length === 0 ? value : handler([clone[head], rest, value], ctx)
    return clone
  }
  // throw new Error("Argument 'Object' must be of type object or array")
  return null
}
export default handler
