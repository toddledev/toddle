import type { Rule } from '../../types'

export const unknownSetUrlParameterRule: Rule<{
  name: string
}> = {
  code: 'unknown set url parameter',
  level: 'error',
  category: 'Unknown Reference',
  visit: (report, args) => {
    if (
      args.nodeType !== 'action-model' ||
      args.value.type !== 'SetURLParameter'
    ) {
      return
    }
    const isValidParameter = (parameterName: string) =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      args.component.route?.path?.some(
        (p) =>
          p.name === parameterName &&
          // It's only valid to set non-static path parameters
          p.type === 'param',
      ) ||
      Object.values(args.component.route?.query ?? {}).some(
        (q) => q.name === parameterName,
      )
    if ('parameter' in args.value) {
      const parameterName = args.value.parameter
      if (!isValidParameter(parameterName)) {
        report(args.path, { name: parameterName })
      }
    } else {
      for (const key of Object.keys(args.value.parameters ?? {})) {
        if (!isValidParameter(key)) {
          report([...args.path, 'parameters', key], { name: key })
        }
      }
    }
  },
}
