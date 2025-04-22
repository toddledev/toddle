import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([n]) => {
  if (typeof n !== 'number') {
    // throw new Error("Argument 'Number' must be of type number")
    return null
  }

  return Math.sqrt(n)
}

export default handler
