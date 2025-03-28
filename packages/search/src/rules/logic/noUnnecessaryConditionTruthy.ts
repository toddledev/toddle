import type { Rule } from '../../types'

export const noUnnecessaryConditionTruthy: Rule = {
  code: 'no-unnecessary-condition-truthy',
  level: 'info',
  category: 'Quality',
  visit: (report, { path, value, nodeType }) => {
    if (nodeType !== 'formula' || value.type !== 'or') {
      return
    }

    if (
      value.arguments.some(
        (arg) =>
          (arg.formula.type === 'value' &&
            Boolean(arg.formula.value) === true) ||
          // Objects and arrays, even empty ones, are always truthy
          arg.formula.type === 'object' ||
          arg.formula.type === 'array',
      )
    ) {
      report(path)
    }
  },
}
