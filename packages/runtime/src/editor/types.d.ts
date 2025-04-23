export interface DragState {
  /**
   * Dragging elements within the initial container is a reorder operation while dragging elements outside the initial container is an insert operation.
   * While they share some common properties, we need to differentiate between the two to handle them differently.
   */
  mode: 'reorder' | 'insert'
  elementType: 'element' | 'component' | 'text'
  copy?: HTMLElement
  element: HTMLElement
  repeatedNodes: HTMLElement[]
  offset: Point
  lastCursorPosition: Point
  initialContainer: HTMLElement
  initialNextSibling: Element | null
  initialRect: DOMRect
  reorderPermutations: Array<{
    nextSibling: Node | null
    rect: DOMRect
  }>
  isTransitioning: boolean
  selectedInsertAreaIndex?: number
  insertAreas?: Array<InsertArea>
  destroying: boolean
}

export interface InsertArea {
  layout: 'block' | 'inline'
  parent: Element
  index: number
  center: Point
  size: number
  direction: 1 | -1
}

export interface Point {
  x: number
  y: number
}
export interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
}
