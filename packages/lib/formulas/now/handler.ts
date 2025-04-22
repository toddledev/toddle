import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Date> = () => {
  return new Date()
}

export default handler
