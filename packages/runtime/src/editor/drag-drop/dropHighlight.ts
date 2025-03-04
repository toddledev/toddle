import type { Point } from '../types'

let highlight: HTMLElement | null = null

/**
 * Visual representation of where a dragged node will be dropped.
 */
export function setDropHighlight(
  element: HTMLElement,
  targetContainer: HTMLElement,
  color: string,
) {
  highlight?.remove()
  if (!element || !targetContainer) {
    return
  }

  highlight = document.createElement('div')
  highlight.classList.add('__drop-area')
  const { top, left } = targetContainer.getBoundingClientRect()
  highlight.style.setProperty('left', `${element.offsetLeft + left}px`)
  highlight.style.setProperty('top', `${element.offsetTop + top}px`)
  highlight.style.setProperty('width', `${element.offsetWidth}px`)
  highlight.style.setProperty('height', `${element.offsetHeight}px`)
  highlight.style.setProperty('border', `2px solid #${color}`)
  highlight.style.setProperty(
    'border-radius',
    window.getComputedStyle(element).borderRadius,
  )
  document.body.append(highlight)
}

/**
 * Visual representation of where a dragged node will be dropped outside of its own container.
 */
export function setExternalDropHighlight({
  layout,
  center,
  length,
  color,
  projectionPoint,
}: {
  layout: 'block' | 'inline'
  center: Point
  length: number
  color: string
  projectionPoint: number
}) {
  highlight?.remove()
  highlight = document.createElement('div')
  highlight.classList.add('__drop-area-line')
  highlight.style.setProperty('top', `${center.y}px`)
  highlight.style.setProperty('left', `${center.x}px`)
  if (layout === 'block') {
    highlight.style.setProperty('width', `${length}px`)
    highlight.style.setProperty('height', `3px`)
    highlight.style.setProperty('translate', '-50% -1.5px')
  } else {
    highlight.style.setProperty('height', `${length}px`)
    highlight.style.setProperty('width', `3px`)
    highlight.style.setProperty('translate', '-1.5px -50%')
  }

  const gradient = `radial-gradient(circle at ${projectionPoint * 100}% ${
    projectionPoint * 100
  }%, #${color} 0%, #${color}80 max(100%, 75px))`
  highlight.style.setProperty('background', gradient)
  document.body.appendChild(highlight)
}

export function removeDropHighlight() {
  highlight?.remove()
  highlight = null
}
