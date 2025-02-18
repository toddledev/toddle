import type { NodeModel } from '@toddledev/core/dist/component/component.types'
import type { ComponentNodeNode, Level, Rule } from '../types'

export function createStaticSizeConstraintRule(
  tag: string,
  maxSize: number,
  level: Level = 'warning',
): Rule<
  {
    tag: string
    maxSize: number
  },
  ComponentNodeNode
> {
  return {
    code: 'size constraint',
    level: level,
    category: 'Performance',
    visit: (report, { nodeType, value, component }) => {
      if (
        nodeType === 'component-node' &&
        value.type === 'element' &&
        value.tag === tag
      ) {
        // TODO: Evaluate tag to calculate size
        let size = 0

        const evaluateElement = (element: NodeModel) => {
          if (element.type !== 'element' && element.type !== 'text') {
            return ''
          }
          const children = (element.children ?? [])
            .map((child) => component.nodes[child])
            .filter(Boolean)
          return `<${element.type === 'element' ? element.tag : 'span'}>
            ${children}.join(
              ' ',
            )}>${element.children.map((child) => evaluateElement(child)).join('')}</${element.tag}>`
        }
        size = new Blob([element]).size
        if (size > maxSize) {
          report(path, { tag, maxSize })
        }
      }
    },
  }
}
