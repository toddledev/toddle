import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([input]) => {
  if (typeof input !== 'string') {
    // throw new Error("Argument 'String' must be of type string")
    return null
  }
  if (input.length === 0) {
    return input
  }
  return input[0].toLocaleUpperCase() + input.substring(1).toLocaleLowerCase()
}

export default handler
