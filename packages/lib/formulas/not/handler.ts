import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { toBoolean } from '@nordcraft/core/dist/utils/util'

const handler: FormulaHandler<boolean> = ([a]) => !toBoolean(a)

export default handler
