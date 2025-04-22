import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = (args) => {
  return Math.max(...args.map(Number))
}

export default handler
