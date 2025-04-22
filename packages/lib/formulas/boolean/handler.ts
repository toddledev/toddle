import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { toBoolean } from '@nordcraft/core/dist/utils/util'

const handler: FormulaHandler<boolean> = ([input]) => {
  return toBoolean(input)
}

export default handler
