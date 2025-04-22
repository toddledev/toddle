import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([value, min, max]) => {
  if (typeof value !== 'number') {
    // throw new Error("Argument 'Value' must be of type number")
    return null
  }
  if (typeof min !== 'number') {
    // throw new Error("Argument 'Min' must be of type number")
    return null
  }
  if (typeof max !== 'number') {
    // throw new Error("Argument 'Max' must be of type number")
    return null
  }
  return Math.min(Math.max(value, min), max)
}

export default handler
