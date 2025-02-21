import { SlotNodeModel } from '@toddledev/core/dist/component/component.types'
import { NodeRenderer, createNode } from './createNode'

export function createSlot({
  path,
  node,
  dataSignal,
  ctx,
  parentElement,
  instance,
  namespace,
}: NodeRenderer<SlotNodeModel>): Element[] {
  const slotName = node.name ?? 'default'
  let children: Element[] = []
  // Is slotted content provided?
  if (ctx.children[slotName]) {
    children = ctx.children[slotName].flatMap((child) => {
      const childDataSignal = child.dataSignal.map((data) => data)
      dataSignal.subscribe((data) => data, {
        destroy: () => childDataSignal.destroy(),
      })
      return createNode({
        ...child,
        dataSignal: childDataSignal,
        parentElement,
        ctx: {
          ...child.ctx,
          providers: ctx.providers,
        },
        instance,
        namespace,
      })
    })
  } else {
    // Otherwise, return placeholder content
    children = node.children.flatMap((child, i) => {
      return createNode({
        id: child,
        path: path + '.' + i,
        dataSignal,
        ctx,
        parentElement,
        instance,
        namespace,
      })
    })
  }

  if (ctx.env.runtime === 'custom-element' && ctx.isRootComponent) {
    const webComponentSlot = document.createElement('slot')
    webComponentSlot.setAttribute('name', slotName)
    children.forEach((child) => {
      webComponentSlot.appendChild(child)
    })

    return [webComponentSlot]
  }

  return children
}
