import type { FormulaHandler } from '@nordcraft/core/dist/types'
const handler: FormulaHandler<string> = ([data, indent]) => {
  if (typeof indent !== 'number') {
    // throw new Error("Argument 'indent' must be of type number")
    return null
  }
  return JSON.stringify(data, null, indent)
}
export default handler
