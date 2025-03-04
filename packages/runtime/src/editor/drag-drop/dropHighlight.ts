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
  highlight.style.setProperty('position', 'fixed')
  highlight.style.setProperty(
    '--drop-area-left',
    `${element.offsetLeft + left}px`,
  )
  highlight.style.setProperty('--drop-area-top', `${element.offsetTop + top}px`)
  highlight.style.setProperty('--drop-area-width', `${element.offsetWidth}px`)
  highlight.style.setProperty('--drop-area-height', `${element.offsetHeight}px`)
  highlight.style.setProperty('--drop-area-outline-color', `#${color}`)
  highlight.style.setProperty(
    '--drop-area-border-radius',
    window.getComputedStyle(element).borderRadius,
  )
  highlight.style.setProperty(
    '--dashed-line-color',
    `color-mix(in srgb, #${color} 33%, transparent)`,
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
  highlight.style.setProperty('--drop-area-left', `${center.x}px`)
  highlight.style.setProperty('--drop-area-top', `${center.y}px`)
  if (layout === 'block') {
    highlight.style.setProperty('--drop-area-width', `${length}px`)
    highlight.style.setProperty('--drop-area-height', `4px`)
    highlight.style.setProperty('--drop-area-translate', '-50% -2px')
  } else {
    highlight.style.setProperty('--drop-area-width', `4px`)
    highlight.style.setProperty('--drop-area-height', `${length}px`)
    highlight.style.setProperty('--drop-area-translate', '-2px -50%')
  }

  const gradient = `radial-gradient(circle at ${projectionPoint * 100}% ${
    projectionPoint * 100
  }%, #${color} 0%, #${color}55 max(100%, 75px))`
  highlight.style.setProperty('--drop-area-background', gradient)
  document.body.appendChild(highlight)
}

export function removeDropHighlight() {
  highlight?.remove()
  highlight = null
}
