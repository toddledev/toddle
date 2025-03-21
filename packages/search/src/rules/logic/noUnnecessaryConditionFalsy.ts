import type { Rule } from '../../types'

export const noUnnecessaryConditionFalsy: Rule = {
  code: 'no-unnecessary-condition-falsy',
  level: 'info',
  category: 'Quality',
  visit: (report, { path, value, nodeType }) => {
    if (nodeType !== 'formula' || value.type !== 'and') {
      return
    }

    if (
      value.arguments.some(
        (arg) =>
          arg.formula.type === 'value' && Boolean(arg.formula.value) === false,
      )
    ) {
      report(path)
    }
  },
}
