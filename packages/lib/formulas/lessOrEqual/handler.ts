import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<boolean> = ([first, second]: any[]) => {
  return first <= second
}

export default handler
