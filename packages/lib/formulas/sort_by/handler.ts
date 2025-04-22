import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown>> = ([
  array,
  formula,
  ascending,
]) => {
  if (!Array.isArray(array)) {
    // throw new Error("Argument 'Array' must be an array")
    return null
  }
  if (typeof formula !== 'function') {
    // throw new Error("Argument 'Formula' must be a formula")
    return null
  }
  if (typeof ascending !== 'boolean') {
    // throw new Error("Argument 'Ascending?' must be a boolean")
    return null
  }

  const ascendingModifier = ascending ? 1 : -1
  return [...array].sort((a: any, b: any) => {
    const keyA = formula({ item: a })
    const keyB = formula({ item: b })
    if (Array.isArray(keyA) && Array.isArray(keyB)) {
      for (const i in keyA) {
        if (keyA[i] === keyB[i]) {
          continue
        }
        return (keyA[i] > keyB[i] ? 1 : -1) * ascendingModifier
      }
      return 0
    }

    if (keyA === keyB) {
      return 0
    }
    return (keyA > keyB ? 1 : -1) * ascendingModifier
  })
}

export default handler

export const getArgumentInputData = (
  [items]: unknown[],
  argIndex: number,
  input: any,
) => {
  if (argIndex === 1 && Array.isArray(items)) {
    return { ...input, Args: { item: items[0] } }
  }

  return input
}
