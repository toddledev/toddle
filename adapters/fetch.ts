const evaluateComponentApis = ({
  apiCache,
  component,
  formulaContext,
  updateApiCache,
  req,
}) => {
  // TODO: Show an example of how to evaluate APIs - potentially using an adapter
  // Verify if we should run the API request during SSR
  const apis: Record<string, ApiStatus> = {}
  for (const apiKey in component.apis) {
    if (Object.prototype.hasOwnProperty.call(component.apis, apiKey)) {
      const api = component.apis[apiKey]
      if (!isLegacyApi(api)) {
        const ssrEnabled = isDefined(api.server?.ssr?.enabled)
          ? toBoolean(
              applyFormula(api.server?.ssr?.enabled.formula, formulaContext),
            )
          : false
        const autoFetch = isDefined(api.autoFetch)
          ? toBoolean(applyFormula(api.autoFetch, formulaContext))
          : false
        if (!ssrEnabled || !autoFetch) {
          return {
            response: {
              data: null,
              isLoading: autoFetch,
              error: null,
            },
          }
        }
        const url = new URL(req.url)
        const { url: requestUrl, requestSettings } = createApiRequest({
          api,
          formulaContext,
          baseUrl: url.origin,
          defaultHeaders: new Headers({
            ...Object.fromEntries(req.headers.entries()),
            // Override accept + accept-encoding to increase the chance that we can work with the response
            // from an API fetched during SSR. Our server doesn't support br encoding for instance.
            accept: '*/*',
            'accept-encoding': 'gzip, deflate',
          }),
        })
        const cacheKey = String(requestHash(requestUrl, requestSettings))
        if (apiCache?.[cacheKey]) {
          return { response: apiCache[cacheKey] }
        }
        // TODO: Override potential http only cookie values in url/headers
        // TODO: Strip cookie header from the request
        try {
          const response = await fetch(requestUrl.href, requestSettings)
          // TODO: Support other content-types
          const data = await response.json()
          // TODO: Use error formula if set
          if (response.ok) {
            apis[cacheKey] = {
              data,
              isLoading: false,
              error: null,
            }
          } else {
            apis[cacheKey] = {
              data: null,
              isLoading: false,
              error: data,
            }
          }
        } catch {
          apis[cacheKey] = {
            data: null,
            isLoading: false,
            error: 'Failed to fetch data',
          }
        }
        updateApiCache(cacheKey, apis[cacheKey])
      }
    }
  }
  return apis
}
