import { UIPointerAction } from "./const"

/**
 * See https://stackoverflow.com/a/10298843/10200417.
 * 
 * @param svg 
 * @param e 
 * @returns 
 */
export function mouseEventToSvgPoint(svg: SVGSVGElement, e: MouseEvent | TouchEvent | DragEvent) {
  let l = svg.createSVGPoint()
  
  if (e instanceof MouseEvent) {
    l.x = e.clientX
    l.y = e.clientY
  }
  else {
    if (e.touches.length > 0) {
      l.x = e.touches.item(0)!.clientX
      l.y = e.touches.item(0)!.clientY
    }
  }

  return l.matrixTransform(svg.getScreenCTM()!.inverse())
}

export function mouseEventToPointerAction(e: MouseEvent | TouchEvent | DragEvent): UIPointerAction {
  switch (e.type) {
    case 'mousemove':
    case 'touchmove':
    case 'drag':
      return UIPointerAction.move

    case 'mousedown':
    case 'touchstart':
    case 'dragstart':
      return UIPointerAction.down

    case 'mouseup':
    case 'touchend':
    case 'dragend':
      return UIPointerAction.up

    default:
      throw new Error(`unsupported mouse event type ${e.type}`)
  }
}
