const LOCALHOSTS = ['http://localhost:54404', 'http://preview.localhost:54404']

export const isLocalhostUrl = (hrefOrOrigin: string) =>
  LOCALHOSTS.some((host) => hrefOrOrigin.startsWith(host))

export const isLocalhostHostname = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1'

export const validateUrl = (url?: string | null, base?: string) => {
  if (typeof url !== 'string') {
    return false
  }

  try {
    const urlObject = new URL(url, base)
    // Creating a new URL object will not correctly encode the search params
    // So we need to iterate over them to make sure they are encoded as that happens when setting them explicitly
    const searchCopy = new URLSearchParams(urlObject.searchParams)
    urlObject.searchParams.forEach((value, key) => {
      urlObject.searchParams.delete(key, value)
    })
    searchCopy.forEach((value, key) => {
      urlObject.searchParams.append(key, value)
    })
    return urlObject
  } catch {
    return false
  }
}

export const PROXY_URL_HEADER = 'x-toddle-url'

export const REWRITE_HEADER = 'x-toddle-rewrite'
