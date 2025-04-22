import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = (numbers) => {
  if (
    !Array.isArray(numbers) ||
    numbers.some((n) => n === null || typeof n !== 'number')
  ) {
    // throw new Error('All inputs must be of type number')
    return null
  }
  return numbers.reduce((result: number, n: any) => {
    return result + Number(n)
  }, 0)
}

export default handler
