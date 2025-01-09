import { DragState } from '../types'
import { DRAG_MOVE_CLASSNAME } from './dragMove'
import { DRAG_REORDER_CLASSNAME } from './dragReorder'
import { removeDropHighlight } from './dropHighlight'

export function dragEnded(dragState: DragState | null) {
  dragState?.element.classList.remove(DRAG_REORDER_CLASSNAME)
  dragState?.element.classList.remove(DRAG_MOVE_CLASSNAME)
  dragState?.element.style.removeProperty('translate')
  dragState?.initialContainer.classList.remove('__drag-container')
  dragState?.copy?.remove()
  dragState?.initialContainer.insertBefore(
    dragState?.element,
    dragState?.initialNextSibling,
  )
  dragState?.repeatedNodes.toReversed().forEach((node) => {
    dragState?.element.insertAdjacentElement('afterend', node)
  })
  removeDropHighlight()
  document
    .querySelectorAll('.__drag-container')
    .forEach((c) => c.classList.remove('__drag-container'))
}
