import type { Component } from '@toddledev/core/dist/component/component.types'

export function omitStyleForComponent<T extends Component | undefined>(
  component: T,
): T {
  const clone = structuredClone(component)
  Object.values(clone?.nodes ?? {}).forEach((node) => {
    if (node.type === 'element' || node.type === 'component') {
      delete node.style
      delete node.variants
      delete node.animations
    }
  })

  return clone
}
