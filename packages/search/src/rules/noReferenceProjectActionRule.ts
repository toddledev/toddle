import { ToddleComponent } from '@toddledev/core/dist/component/ToddleComponent'
import type { Rule } from '../types'

export const noReferenceProjectActionRule: Rule<void> = {
  code: 'no-reference project action',
  level: 'warning',
  category: 'No References',
  visit: (report, { path, files, value, nodeType, memo }) => {
    if (nodeType !== 'project-action') {
      return
    }

    const projectActionReferences = memo('projectActionReferences', () => {
      const usedActions = new Set<string>()
      for (const component of Object.values(files.components)) {
        const c = new ToddleComponent({
          // Enforce that the component is not undefined since we're iterating
          component: component!,
          getComponent: (name, packageName) =>
            packageName
              ? files.packages?.[packageName]?.components[name]
              : files.components[name],
          packageName: undefined,
          globalFormulas: {
            formulas: files.formulas,
            packages: files.packages,
          },
        })
        for (const [, action] of c.actionModelsInComponent()) {
          if (action.type === 'Custom' || action.type === undefined) {
            usedActions.add(action.name)
          }
        }
      }
      return usedActions
    })

    if (!projectActionReferences.has(value.name)) {
      report(path)
    }
  },
}
