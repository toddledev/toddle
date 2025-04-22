import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<string> = ([name], { env, root }) => {
  if (!name || typeof name !== 'string') {
    return null
  }
  if (!env.isServer) {
    if (root instanceof ShadowRoot) {
      return null
    }
    return (
      root.cookie
        .split('; ')
        ?.find((row) => row.startsWith(`${name}=`))
        ?.split('=')[1] ?? null
    )
  } else {
    return env.request.cookies[name] ?? null
  }
}

export default handler
