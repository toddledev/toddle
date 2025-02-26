import { getRectData } from '../../editor-preview.main'
import { tryStartViewTransition } from '../../utils/tryStartViewTransition'
import type { DragState } from '../types'
import { DRAG_MOVE_CLASSNAME } from './dragMove'
import { DRAG_REORDER_CLASSNAME } from './dragReorder'
import { removeDropHighlight } from './dropHighlight'

export async function dragEnded(dragState: DragState, canceled: boolean) {
  dragState.destroying = true
  const selectedInsertArea =
    dragState.insertAreas?.[dragState.selectedInsertAreaIndex ?? -1]
  const siblings =
    (dragState.mode === 'insert' && !canceled
      ? selectedInsertArea?.parent
      : dragState.initialContainer
    )?.querySelectorAll('[data-id]') ?? []
  dragState.element.style.setProperty(
    'view-transition-name',
    'dropped-item-self',
  )
  siblings.forEach((node, i) => {
    if (node instanceof HTMLElement) {
      node.style.setProperty(
        'view-transition-name',
        'dropped-item-sibling-' + i,
      )
    }
  })
  await tryStartViewTransition(() => {
    if (canceled) {
      dragState.copy?.remove()
      dragState.initialContainer.insertBefore(
        dragState.element,
        dragState.initialNextSibling,
      )
    } else if (dragState.mode === 'insert') {
      selectedInsertArea?.parent.insertBefore(
        dragState.element,
        selectedInsertArea.parent.childNodes[selectedInsertArea.index],
      )
    }

    dragState.element.classList.remove(DRAG_REORDER_CLASSNAME)
    dragState.element.classList.remove(DRAG_MOVE_CLASSNAME)
    dragState.element.style.removeProperty('translate')
    dragState.repeatedNodes.toReversed().forEach((node) => {
      dragState.element.insertAdjacentElement('afterend', node)
    })
    removeDropHighlight()
    window.parent.postMessage(
      {
        type: 'selectionRect',
        rect: getRectData(dragState.element),
      },
      '*',
    )
  }).finished.then(() => {
    dragState.element.style.removeProperty('view-transition-name')
    siblings.forEach((node) => {
      if (node instanceof HTMLElement) {
        node.style.removeProperty('view-transition-name')
      }
    })
  })
}
