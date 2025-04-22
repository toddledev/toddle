import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = (numbers) => {
  if (numbers.some((n) => isNaN(Number(n)))) {
    return null
  }
  return (numbers as number[]).reduce<number>(
    (product, num) => product * num,
    1,
  )
}

export default handler
