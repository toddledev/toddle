import type { FormulaHandler } from '@nordcraft/core/dist/types'
import { toBoolean } from '@nordcraft/core/dist/utils/util'

const handler: FormulaHandler<Array<string>> = ([
  inputString,
  regex,
  globalFlag,
  ignoreCaseFlag,
  multiLineFlag,
]) => {
  if (typeof inputString !== 'string' || typeof regex !== 'string') {
    return []
  }
  const flags = [
    toBoolean(globalFlag) ? 'g' : '',
    toBoolean(ignoreCaseFlag) ? 'i' : '',
    toBoolean(multiLineFlag) ? 'm' : '',
  ].join('')

  const re = new RegExp(regex, flags)
  return inputString.match(re) ?? []
}
export default handler
