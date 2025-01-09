import { DragState } from '../types'
import { DRAG_MOVE_CLASSNAME } from './dragMove'
import { DRAG_REORDER_CLASSNAME } from './dragReorder'
import { removeDropHighlight } from './dropHighlight'

export function dragEnded(dragState: DragState | null) {
  dragState?.element.classList.remove(DRAG_REORDER_CLASSNAME)
  dragState?.element.classList.remove(DRAG_MOVE_CLASSNAME)
  dragState?.element.style.removeProperty('translate')
  dragState?.copy?.remove()
  dragState?.repeatedNodes.toReversed().forEach((node) => {
    dragState?.element.insertAdjacentElement('afterend', node)
  })
  removeDropHighlight()
}
