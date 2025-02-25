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
  const { top, left } = targetContainer.getBoundingClientRect()
  highlight.style.setProperty('position', 'fixed')
  highlight.style.setProperty('left', `${element.offsetLeft + left}px`)
  highlight.style.setProperty('top', `${element.offsetTop + top}px`)
  highlight.style.setProperty('width', `${element.offsetWidth}px`)
  highlight.style.setProperty('height', `${element.offsetHeight}px`)
  highlight.style.setProperty('view-transition-name', 'drop-highlight')
  highlight.style.setProperty('outline', `2px solid #${color}`)
  highlight.style.setProperty('outline-offset', '-2px')
  highlight.style.setProperty(
    'border-radius',
    window.getComputedStyle(element).borderRadius,
  )
  highlight.style.setProperty('background-size', '9px 9px')
  highlight.style.setProperty('background-color', 'rgba(0, 0, 0, 0)')
  highlight.style.setProperty(
    '--dashed-line-color',
    `color-mix(in srgb, #${color} 33%, transparent)`,
  )
  highlight.style.setProperty(
    'background-image',
    'repeating-linear-gradient(45deg, var(--dashed-line-color) 0, var(--dashed-line-color) 1px, transparent 0, transparent 50%)',
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
