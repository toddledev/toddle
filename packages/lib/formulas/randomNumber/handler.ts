import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<number> = () => {
  return Math.random()
}

export default handler
