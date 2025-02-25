import type { DragState } from '../types'
import { removeDropHighlight } from './dropHighlight'

export function dragEnded(dragState: DragState | null) {
  dragState?.element.style.removeProperty('translate')
  dragState?.copy?.remove()
  dragState?.repeatedNodes.toReversed().forEach((node) => {
    dragState?.element.insertAdjacentElement('afterend', node)
  })
  removeDropHighlight()
  if (dragState?.mode === 'insert') {
    dragState?.element.remove()
  }
}
