import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Date> = ([timestamp]) => {
  if (typeof timestamp === 'number') {
    return new Date(timestamp)
  } else {
    // throw new Error('Invalid input for Date')
    return null
  }
}

export default handler
