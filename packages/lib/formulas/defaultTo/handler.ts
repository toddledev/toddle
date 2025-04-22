import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { toBoolean } from '@nordcraft/core/dist/utils/util'

const handler: FormulaHandler<unknown> = (values) => {
  for (const value of values) {
    if (toBoolean(value)) {
      return value
    }
  }
  return null
}

export default handler
