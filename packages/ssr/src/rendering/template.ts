import { STRING_TEMPLATE } from '@toddledev/core/dist/api/template'
import { ToddleServerEnv } from '@toddledev/core/dist/formula/formula'
import { isDefined } from '@toddledev/core/dist/utils/util'
import { skipCookieHeader, skipToddleHeader } from '../utils/headers'

export const applyTemplateValues = (
  input: string | null | undefined,
  cookies: ToddleServerEnv['request']['cookies'],
) => {
  if (!isDefined(input)) {
    return ''
  }
  const cookieRegex = /{{ cookies\.(.+?) }}/gm
  let output = input
  const cookieNames = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = cookieRegex.exec(input)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === cookieRegex.lastIndex) {
      cookieRegex.lastIndex++
    }
    cookieNames.add(m[1])
  }
  for (const cookieName of cookieNames) {
    const cookieValue = cookies[cookieName]
    if (cookieValue) {
      output = output.replaceAll(
        STRING_TEMPLATE('cookies', cookieName),
        cookieValue,
      )
    }
  }
  return output
}

export const sanitizeProxyHeaders = ({
  cookies,
  headers,
}: {
  cookies: Record<string, string>
  headers: Headers
}) =>
  new Headers(
    mapTemplateHeaders({
      cookies,
      headers: skipCookieHeader(skipToddleHeader(headers)),
    }),
  )

export const mapTemplateHeaders = ({
  cookies,
  headers,
}: {
  cookies: Record<string, string>
  headers: Headers
}) =>
  new Headers(
    [...headers.entries()].map(([name, value]): [string, string] => [
      name,
      // Replace template values in the header value
      applyTemplateValues(value, cookies),
    ]),
  )
