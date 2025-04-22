import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown>> = ([inputString, delimiter]) => {
  if (typeof inputString !== 'string') {
    // throw new Error("Argument 'Input' must be of type string")
    return null
  }
  if (typeof delimiter !== 'string') {
    // throw new Error("Argument 'Delimeter' must be of type string")
    return null
  }
  return inputString.split(delimiter)
}
export default handler
