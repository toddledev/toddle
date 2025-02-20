import {
  ComponentData,
  TextNodeModel,
} from '@toddledev/core/dist/component/component.types'
import { applyFormula } from '@toddledev/core/dist/formula/formula'
import { Signal } from '../signal/signal'
import { ComponentContext } from '../types'

export type RenderTextProps = {
  node: TextNodeModel
  dataSignal: Signal<ComponentData>
  id: string
  path: string
  ctx: ComponentContext
}

/**
 * Create a text node
 *
 * Note: We wrap the text in a <span> to make it easier to select/highlight the text node in the preview.
 * We should find a better way to do this without wrapping the node, and instead use `createTextNode`.
 */
export function createText({
  node,
  id,
  path,
  dataSignal,
  ctx,
}: RenderTextProps): HTMLSpanElement {
  const { value } = node
  let elem: HTMLElement
  const existingElement = document.querySelector(
    `[data-node-id="${id}"]`,
  ) as HTMLElement | null
  if (existingElement && !existingElement.hasAttribute('data-id')) {
    elem = existingElement
  } else {
    elem = document.createElement('span')
  }

  elem.setAttribute('data-node-id', id)
  if (typeof id === 'string') {
    elem.setAttribute('data-id', path)
  }
  if (ctx.isRootComponent === false) {
    elem.setAttribute('data-component', ctx.component.name)
  }
  elem.setAttribute('data-node-type', 'text')
  if (value.type !== 'value') {
    const sig = dataSignal.map((data) =>
      String(
        applyFormula(value, {
          data,
          component: ctx.component,
          formulaCache: ctx.formulaCache,
          root: ctx.root,
          package: ctx.package,
          toddle: ctx.toddle,
          env: ctx.env,
        }),
      ),
    )
    sig.subscribe((value) => {
      elem.innerText = value
    })
  } else {
    elem.innerText = String(value.value)
  }
  return elem
}
