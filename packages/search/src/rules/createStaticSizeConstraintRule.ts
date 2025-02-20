import type { NodeModel } from '@toddledev/core/dist/component/component.types'
import type { Level, Rule } from '../types'

export function createStaticSizeConstraintRule(
  tag: string,
  maxSize: number,
  level: Level = 'warning',
): Rule<{
  tag: string
  size: number
}> {
  return {
    code: 'size constraint',
    level: level,
    category: 'Performance',
    visit: (report, args) => {
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        args.nodeType === 'component-node' &&
        args.value.type === 'element' &&
        args.value.tag === tag
      ) {
        let size = 0
        const component = args.component
        const evaluateElement = (element?: NodeModel): string => {
          if (
            !element ||
            (element.type !== 'element' &&
              element.type !== 'text' &&
              element.type !== 'slot' &&
              element.type !== 'component')
          ) {
            return ''
          }
          const children = (element.children ?? []).map((child) =>
            evaluateElement(component.nodes[child]),
          )
          const tag = element.type === 'element' ? element.tag : 'span'
          return `<${tag}>${children.join('')}</${tag}>`
        }
        const staticElement = evaluateElement(args.value)
        console.log(staticElement)
        size = new Blob([staticElement]).size
        if (size > maxSize) {
          report(args.path, { tag, size })
        }
      }
    },
  }
}
