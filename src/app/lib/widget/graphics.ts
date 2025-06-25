import { UIPointerAction } from "./const"

/**
 * See https://stackoverflow.com/a/10298843/10200417.
 * 
 * @param svg 
 * @param e 
 * @returns 
 */
export function mouseEventToSvgPoint(svg: SVGSVGElement, e: MouseEvent | TouchEvent) {
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

export function mouseEventToPointerAction(e: MouseEvent | TouchEvent): UIPointerAction {
  switch (e.type) {
    case 'mousemove':
      return UIPointerAction.move

    case 'mousedown':
    case 'touchstart':
      return UIPointerAction.down

    case 'mouseup':
    case 'touchend':
      return UIPointerAction.up

    default:
      throw new Error(`unsupported mouse event type ${e.type}`)
  }
}
