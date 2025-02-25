import type { ActionHandler } from '@toddledev/core/dist/types'

const handler: ActionHandler = ([url, openInNewTab], ctx) => {
  if (typeof url === 'string') {
    if (ctx.env.runtime === 'preview') {
      // Attempt to notify the parent about the failed navigation attempt
      window.parent?.postMessage({ type: 'blockedNavigation', url }, '*')
    } else {
      if (openInNewTab) {
        window.open(url, '_blank')
      } else {
        window.location.href = url
      }
    }
  }
}

export default handler
