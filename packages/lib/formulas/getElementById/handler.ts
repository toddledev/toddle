import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<HTMLElement> = ([id], { root }) => {
  if (typeof id !== 'string') {
    // throw new Error("Argument 'Id' must be a string")
    return null
  }

  return root.getElementById(id)
}

export default handler
