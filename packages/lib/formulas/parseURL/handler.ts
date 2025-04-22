import type { FormulaHandler } from '@nordcraft/core/dist/types'

const handler: FormulaHandler<{
  hostname: string
  searchParams: Record<string, string>
  path: string[]
  hash: string
  href: string
  protocol: string
  port: string
  origin: string
}> = ([url, base]) => {
  if (typeof url !== 'string') {
    // throw new Error(`Invalid parameter type "${typeof url}" for URL`)
    return null
  }
  try {
    const {
      hostname,
      searchParams,
      pathname,
      hash,
      href,
      protocol,
      port,
      origin,
    } = new URL(url, typeof base === 'string' ? base : undefined)
    return {
      hostname,
      searchParams: Object.fromEntries(searchParams),
      // Remove the first "empty" path parameter and return path parameters as an array
      path: pathname.split('/').filter((p, i) => i !== 0 || p !== ''),
      // Remove the leading '#' (havelåge)
      hash: hash.replace('#', ''),
      href,
      protocol,
      port,
      origin,
    }
  } catch {
    // Invalid url
    return null
  }
}
export default handler
