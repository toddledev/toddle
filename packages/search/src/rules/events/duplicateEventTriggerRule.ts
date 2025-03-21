import type { Rule } from '../../types'

export const duplicateEventTriggerRule: Rule<{ trigger: string }> = {
  code: 'duplicate event trigger',
  level: 'warning',
  category: 'Quality',
  visit: (report, { nodeType, path, value }) => {
    if (nodeType !== 'component-node' || value.type !== 'element') {
      return
    }
    const eventTriggers = new Set<string>()

    Object.entries(value.events ?? {}).forEach(([key, event]) => {
      if (typeof event.trigger !== 'string') {
        return
      }
      if (eventTriggers.has(event.trigger)) {
        report([...path, 'events', key], { trigger: event.trigger })
      }
      eventTriggers.add(event.trigger)
    })
  },
}
