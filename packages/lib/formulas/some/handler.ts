import type { FormulaHandler } from '@nordcraft/core/dist/types'

export const handler: FormulaHandler<boolean> = ([items, fx]: unknown[]) => {
  if (typeof fx !== 'function') {
    // throw new Error("Argument 'Formula' must be of type formula")
    return null
  }
  if (Array.isArray(items)) {
    return items.some((item, index) => fx({ item, index }))
  }
  if (items && typeof items === 'object') {
    return Object.entries(items).some(([key, value]) => fx({ key, value }))
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
      return { ...input, Args: { key: first[0], value: first[1] } }
    }
  }
  return input
}
