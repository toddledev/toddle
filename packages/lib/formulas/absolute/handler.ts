import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([a]) => {
  if (typeof a !== 'number') {
    // throw new Error('Argument must be a number')
    return null
  }
  return Math.abs(a)
}

export default handler
