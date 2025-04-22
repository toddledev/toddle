import type { FormulaHandler } from '@nordcraft/core/dist/types'

export const handler: FormulaHandler<
  Array<unknown> | Record<string, unknown>
> = ([items, func]) => {
  if (typeof func !== 'function') {
    // throw new Error("Argument 'Formula' must be of type Formula")
    return null
  }

  if (Array.isArray(items)) {
    return items.filter((item, index) => func({ item, index }))
  }
  if (items && typeof items === 'object') {
    return Object.fromEntries(
      Object.entries(items).filter(([key, value]) => func({ key, value })),
    )
  }
  if (Array.isArray(items)) {
    return items.filter((item, index) => func({ item, index }))
  }
  // throw new Error("Argument 'Array' must be of type array or object")
  return null
}

export default handler

export const getArgumentInputData = (
  [items]: unknown[],
  argIndex: number,
  input: any,
) => {
  if (argIndex === 0) {
    return input
  }

  if (Array.isArray(items)) {
    return { ...input, Args: { item: items[0], index: 0 } }
  }
  if (items && typeof items === 'object') {
    const [first] = Object.entries(items)
    if (first) {
      return { ...input, Args: { value: first[1], key: first[0] } }
    }
  }
  return input
}
