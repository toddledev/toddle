import { ElementNodeModel } from '@toddledev/core/dist/component/component.types'
import { ComponentContext } from '../types'

export function getElementTagName(
  node: ElementNodeModel,
  ctx: ComponentContext,
  id: string,
) {
  if (ctx.component.version === 2 && id === 'root') {
    return `${ctx.package ?? ctx.toddle.project}-${node.tag}`
  }

  return node.tag
}
