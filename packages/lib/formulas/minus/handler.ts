import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([a, b]) => {
  const first = Number(a)
  const second = Number(b)
  if (isNaN(first) || isNaN(second)) {
    // throw new Error('Both Arguments must be of type number')
    return null
  }
  return first - second
}

export default handler
