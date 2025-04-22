import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Array<{ key: string; value: unknown }>> = ([
  object,
]) => {
  if (typeof object === 'object' && object !== null) {
    return Object.entries(object).map(([key, value]) => ({ key, value }))
  }
  // throw new Error('Argument Object must be of type object')
  return null
}

export default handler
