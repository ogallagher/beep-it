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
