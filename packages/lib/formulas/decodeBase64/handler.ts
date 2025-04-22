import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([input]) => {
  if (typeof input !== 'string') {
    // throw new Error("Argument 'Input' must be a string")
    return null
  }
  return atob(input)
}

export default handler
