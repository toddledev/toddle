import type { Rule } from '../../types'
import { isLegacyAction } from '../../util/helpers'

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
