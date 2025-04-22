import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = ([list]) => {
  if (Array.isArray(list)) {
    let sum = 0
    for (const n of list) {
      if (isNaN(n) || typeof n !== 'number') {
        // throw new Error('The Array must only contain numbers')
        return null
      }
      sum += n
    }
    return sum
  }
  // throw new Error('The Array argument must be of type array')
  return null
}

export default handler
