import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = (args) => {
  return Math.min(...args.map(Number))
}

export default handler
