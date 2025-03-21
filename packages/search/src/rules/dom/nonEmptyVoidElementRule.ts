import type { Rule } from '../../types'

import { VOID_HTML_ELEMENTS } from '@toddledev/ssr/dist/const'
/**
 * Lighthouse reports a similar issue:
 * https://web.dev/articles/optimize-cls?utm_source=lighthouse&utm_medium=devtools#images_without_dimensions
 */
export const nonEmptyVoidElementRule: Rule<{ tag: string }> = {
  code: 'non-empty void element',
  level: 'warning',
  category: 'Quality',
  visit: (report, { path, nodeType, value }) => {
    if (
      nodeType !== 'component-node' ||
      value.type !== 'element' ||
      value.children.length <= 0 ||
      !VOID_HTML_ELEMENTS.includes(value.tag)
    ) {
      return
    }
    report(path, { tag: value.tag })
  },
}
