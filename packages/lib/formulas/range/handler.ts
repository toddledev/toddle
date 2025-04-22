import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<number>> = ([min, max]) => {
  if (typeof min !== 'number') {
    return null
  }
  if (typeof max !== 'number') {
    return null
  }
  if (min > max) {
    return []
  }
  return Array.from({ length: max - min + 1 }, (_, i) => i + min)
}

export default handler
