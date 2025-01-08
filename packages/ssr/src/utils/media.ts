export const isCloudflareImagePath = (path?: string | null): path is string =>
  typeof path === 'string' && path.startsWith('/cdn-cgi/imagedelivery/')
