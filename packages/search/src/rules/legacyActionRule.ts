import { ActionModel } from '@toddledev/core/dist/component/component.types'
import type { Rule } from '../types'

export const legacyActionRule: Rule<{
  name: string
}> = {
  code: 'legacy action',
  level: 'warning',
  category: 'Deprecation',
  visit: (report, { path, value, nodeType }) => {
    if (nodeType !== 'action-model') {
      return
    }

    if (isLegacyAction(value)) {
      let details: { name: string } | undefined
      if ('name' in value) {
        details = {
          name: value.name,
        }
      }

      report(path, details)
    }
  },
}

const isLegacyAction = (model: ActionModel) => {
  switch (model.type) {
    case 'Custom':
    case undefined:
      // Legacy action has no version, while newer ones have a version 2+
      return !model.version && LEGACY_CUSTOM_ACTIONS.has(model.name)
  }
  return false
}

const LEGACY_CUSTOM_ACTIONS = new Set([
  'If',
  'PreventDefault',
  'StopPropagation',
  'Copy To Clipboard',
  'CopyToClipboard',
  'UpdateVariable',
  'Update Variable',
  'Update URL parameter',
  'updateUrlParameters',
  'UpdateQueryParam',
  'Update Query',
  'Fetch',
  'SetTimeout',
  'SetInterval',
  'FocusElement',
  'Debug',
  'GoToURL',
  'TriggerEvent',
])
