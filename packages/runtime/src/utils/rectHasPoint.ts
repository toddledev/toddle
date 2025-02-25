import type { Point } from '../editor/types'

export function rectHasPoint(rect: DOMRect, { x, y }: Point) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}
