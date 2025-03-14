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
    const parameterName = args.value.parameter
    const component = args.component
    if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      component.route?.path?.some(
        (p) =>
          p.name === parameterName &&
          // It's only valid to set non-static path parameters
          p.type === 'param',
      ) ||
      Object.values(component.route?.query ?? {}).some(
        (q) => q.name === parameterName,
      )
    ) {
      return
    }
    report(args.path, { name: parameterName })
  },
}
