import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { parseJSONWithDate } from '@nordcraft/core/dist/utils/json'

const handler: FormulaHandler<unknown> = ([data]) => {
  if (typeof data !== 'string') {
    // throw new Error("Argument 'JSON string' must be of type string")
    return null
  }
  try {
    return parseJSONWithDate(data)
  } catch {
    return null
  }
}
export default handler
