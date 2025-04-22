import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([input]) => {
  if (typeof input !== 'string') {
    // throw new Error("Argument 'String' must be of type string")
    return null
  }
  return input.toLocaleUpperCase()
}

export default handler
