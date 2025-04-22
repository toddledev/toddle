import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([data, indentation]) => {
  const indent = isNaN(Number(indentation)) ? 0 : Number(indentation)
  return JSON.stringify(data, null, indent)
}
export default handler
