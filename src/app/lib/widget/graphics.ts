import { UIPointerAction } from "./const"

/**
 * See https://stackoverflow.com/a/10298843/10200417.
 * 
 * @param svg 
 * @param e 
 * @returns 
 */
export function mouseEventToSvgPoint(svg: SVGSVGElement, e: MouseEvent) {
  let l = svg.createSVGPoint()
  l.x = e.clientX
  l.y = e.clientY

  return l.matrixTransform(svg.getScreenCTM()!.inverse())
}

export function mouseEventToPointerAction(e: MouseEvent): UIPointerAction {
  switch (e.type) {
    case 'mousemove':
      return UIPointerAction.move

    case 'mousedown':
      return UIPointerAction.down

    case 'mouseup':
      return UIPointerAction.up

    default:
      throw new Error(`unsupported mouse event type ${e.type}`)
  }
}
