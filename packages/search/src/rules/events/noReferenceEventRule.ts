import type { Rule } from '../../types'
import { isLegacyAction } from '../../util/helpers'

export const noReferenceEventRule: Rule<{ name: string }> = {
  code: 'no-reference event',
  level: 'warning',
  category: 'No References',
  visit: (report, args) => {
    if (args.nodeType !== 'component-event') {
      return
    }
    const { path, memo, value } = args
    const { component, event } = value
    const events = memo(`${component.name}-events`, () => {
      const events = new Set<string>()
      for (const [, action] of component.actionModelsInComponent()) {
        if (isLegacyAction(action)) {
          if (
            'name' in action &&
            'arguments' in action &&
            action.name === 'TriggerEvent' &&
            action.version === undefined
          ) {
            const formula = action.arguments?.find(
              (a) => a.name === 'name',
            )?.formula
            if (
              formula?.type === 'value' &&
              typeof formula.value === 'string'
            ) {
              events.add(formula.value)
            }
          }
        } else if (action.type === 'TriggerEvent') {
          events.add(action.event)
        }
      }
      return events
    })
    if (events.has(event.name)) {
      return
    }

    report(path, { name: event.name })
  },
}
