import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([
  input,
  searchValue,
  replaceValue,
]) => {
  if (typeof input !== 'string') {
    // throw new Error(
    //   `Argument 'Input' must be a string, received ${typeof input}`,
    // )
    return null
  }

  if (typeof searchValue !== 'string') {
    // throw new Error(
    //   `Argument 'Search value' must be a string, received ${typeof searchValue}`,
    // )
    return null
  }

  return input.replaceAll(searchValue, String(replaceValue))
}

export default handler
