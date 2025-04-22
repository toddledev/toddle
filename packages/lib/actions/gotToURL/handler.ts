import type { ActionHandler } from '@nordcraft/core/dist/types'

const handler: ActionHandler = ([url], ctx) => {
  if (typeof url === 'string') {
    if (ctx.env.runtime === 'preview') {
      // Attempt to notify the parent about the failed navigation attempt
      window.parent?.postMessage({ type: 'blockedNavigation', url }, '*')
    } else {
      window.location.href = url
    }
  }
}

export default handler
