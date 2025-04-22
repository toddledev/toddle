import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([str]) => {
  if (typeof str !== 'string') {
    // throw new Error("Argument 'String' must be of type string")
    return null
  }
  return str.trim()
}

export default handler
