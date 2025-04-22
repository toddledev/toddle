import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<unknown>> = ([list, value]) => {
  if (!Array.isArray(list)) {
    // throw new Error('The Array argument must be of type array')
    return null
  }
  return [...list, value]
}

export default handler
