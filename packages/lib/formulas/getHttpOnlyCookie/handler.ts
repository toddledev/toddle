import { STRING_TEMPLATE } from '@nordcraft/core/dist/api/template'
import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([name]) => {
  if (!name || typeof name !== 'string') {
    return null
  }
  return STRING_TEMPLATE('cookies', name)
}

export default handler
