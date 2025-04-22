import type { FormulaHandler } from '@nordcraft/core/dist/types'

export const handler: FormulaHandler<Record<string, Array<unknown>>> = ([
  items,
  func,
]) => {
  if (typeof func !== 'function') {
    // throw new Error("Argument 'Formula' must be of type formula")
    return null
  }

  if (!items || typeof items !== 'object' || !Array.isArray(items)) {
    // throw new Error("Argument 'Array' must be of type array")
    return null
  }

  const res: Record<string, any> = {}

  for (const index in items) {
    const item = items[index]
    const key = String(func({ item, index }))
    res[key] = res[key] ?? []
    res[key].push(item)
  }
  return res
}

export default handler

export const getArgumentInputData = (
  [items]: unknown[],
  argIndex: number,
  input: any,
) => {
  if (argIndex === 1 && Array.isArray(items)) {
    return { ...input, Args: { item: items[0], index: 0 } }
  }
  return input
}
