import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([input, decimals]) => {
  if (typeof input !== 'number') {
    // throw new Error("Argument 'Input' must be of type number")
    return null
  }
  if (typeof decimals !== 'number') {
    // throw new Error("Argument 'Decimals' must be of type number")
    return null
  }

  const multiplier = Math.max(1, Math.pow(10, decimals))
  return Math.round(input * multiplier) / multiplier
}

export default handler
