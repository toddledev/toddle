import type { Rule } from '../../types'

export const noReferenceApiRule: Rule<void> = {
  code: 'no-reference api',
  level: 'warning',
  category: 'No References',
  visit: (report, args) => {
    if (args.nodeType !== 'component-api') {
      return
    }
    const { path, value, memo, component } = args
    if (!component) {
      return
    }

    const componentApiReferences = memo(
      `componentApiReferences/${component.name}]`,
      () => {
        const usedApis = new Set<string>()
        for (const [, formula] of component.formulasInComponent()) {
          if (
            formula.type === 'path' &&
            formula.path[0] === 'Apis' &&
            typeof formula.path[1] === 'string'
          ) {
            usedApis.add(formula.path[1])
          }
        }
        for (const [, action] of component.actionModelsInComponent()) {
          if (action.type === 'Fetch') {
            usedApis.add(action.api)
          }
        }
        return usedApis
      },
    )
    if (componentApiReferences.has(value.name)) {
      return
    }
    report(path)
  },
}
