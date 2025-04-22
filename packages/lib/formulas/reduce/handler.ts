import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<unknown> = ([items, fx, init]) => {
  if (typeof fx !== 'function') {
    // throw new Error("Argument 'Formula' must be of type formula")
    return null
  }
  if (Array.isArray(items)) {
    return items.reduce(
      (result, item, index) => fx({ result, item, index }),
      init,
    )
  }
  if (items && typeof items === 'object') {
    return Object.entries(items).reduce(
      (result, [key, value]) => fx({ result, key, value }),
      init,
    )
  }
  // throw new Error("Argument 'Array' must be of type array or object")
  return null
}
export default handler

export const getArgumentInputData = (
  [items, _, result]: unknown[],
  argIndex: number,
  input: any,
) => {
  if (argIndex !== 1) {
    return input
  }
  if (Array.isArray(items)) {
    return {
      ...input,
      Args: {
        item: items[0],
        index: 0,
        result,
      },
    }
  }
  if (items && typeof items === 'object') {
    const [first] = Object.entries(items)
    if (first) {
      return {
        ...input,
        Args: {
          key: first[0],
          value: first[1],
          result,
        },
      }
    }
  }
  return input
}
