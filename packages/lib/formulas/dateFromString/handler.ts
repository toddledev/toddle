import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<Date> = ([date]) => {
  if (typeof date === 'string') {
    return new Date(date)
  } else {
    // throw new Error('Invalid input for Date')
    return null
  }
}

export default handler
