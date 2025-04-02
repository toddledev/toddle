import type { ComponentFormula } from '@toddledev/core/dist/component/component.types'
import { get } from '@toddledev/core/dist/utils/collections'
import { isDefined } from '@toddledev/core/dist/utils/util'
import type { Rule } from '../../types'

export const unknownComponentFormulaInputRule: Rule<{
  name?: string | null
}> = {
  code: 'unknown component formula input',
  level: 'error',
  category: 'Unknown Reference',
  visit: (report, { path, files, value, nodeType }) => {
    if (
      nodeType !== 'formula' ||
      value.type !== 'path' ||
      value.path?.[0] !== 'Args' ||
      value.path.length < 2 ||
      path[0] !== 'components' ||
      path[2] !== 'formulas' ||
      path.length < 5
    ) {
      return
    }
    const [components, componentName, formulas, formulaName] = path as string[]
    const formula: ComponentFormula = get(files, [
      components,
      componentName,
      formulas,
      formulaName,
    ])
    const args = formula.arguments ?? []
    const argName = value.path[1]
    if (!isDefined(argName) || !args.some((arg) => arg.name === argName)) {
      report(path, { name: argName })
    }
  },
}
