import type { FormulaHandler } from '@nordcraft/core/dist/types'

export const handler: FormulaHandler<number> = ([items, fx]: unknown[]) => {
  if (typeof fx !== 'function') {
    // throw new Error("Argument 'Formula' must be of type formula")
    return null
  }
  if (Array.isArray(items)) {
    return items.findIndex((item, index) => fx({ item, index }))
  }
  if (items && typeof items === 'object') {
    return Object.entries(items).findIndex(([key, value]) => fx({ key, value }))
  }
  // throw new Error("Argument 'Array' must be of type object or array")
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
      return { ...input, Args: { key: first[0], value: first[1] } }
    }
  }
  return input
}
