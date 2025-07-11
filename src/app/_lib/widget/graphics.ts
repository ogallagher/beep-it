import { Group, Pt } from 'pts'
import { CardinalDirection, KeyboardAction, UIPointerAction } from './const'

/**
 * See https://stackoverflow.com/a/10298843/10200417.
 * 
 * @param svg 
 * @param e 
 * @returns 
 */
export function mouseEventToSvgPoint(svg: SVGSVGElement, e: MouseEvent | TouchEvent | DragEvent) {
  const l = svg.createSVGPoint()
  
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

export function keyboardEventToKeyboardAction(e: KeyboardEvent): KeyboardAction {
  switch (e.type) {
    case 'keydown':
      return KeyboardAction.down

    case 'keyup':
      return KeyboardAction.up

    default:
      throw new Error(`unsupported keyboard event type ${e.type}`)
  }
}

/**
 * @param pStart 
 * @param pEnd 
 * @param pDir Cardinal direction encoded as a code point in the X component.
 * @returns Signed distance along a cardinal direction between `pStart` and `pEnd`.
 */
export function cardinalDistance(pStart: Pt, pEnd: Pt, pDir: Pt): number {
  const direction = String.fromCodePoint(pDir.x) as CardinalDirection

  switch (direction) {
    case CardinalDirection.Up:
      return pStart.y - pEnd.y
    case CardinalDirection.Down:
      return pEnd.y - pStart.y
    case CardinalDirection.Left:
      return pStart.x - pEnd.x
    case CardinalDirection.Right:
      return pEnd.x - pStart.x
  }
}

/**
 * @param curve Curve/spline expressed as a list of control points with absolute coordinates.
 */
export function curveToSvgPathD(curve: Group, screenSize: number, sourceSize: number) {
  const d: string[] = []
  let pi = 0
  let rn = curve.length

  const scale = sourceSize / screenSize
  curve.forEach(p => p.multiply(scale).round())

  function advance(controlSteps: number) {
    pi += controlSteps
    rn -= controlSteps
  }

  // move to first point
  d.push(`M ${curve[pi].x},${curve[pi].y}`)
  advance(1)

  // first curve 
  if (rn >= 3) {
    d.push(
      [
        'C',
        `${curve[pi].x},${curve[pi].y}`,
        `${curve[pi+1].x},${curve[pi+1].y}`,
        `${curve[pi+2].x},${curve[pi+2].y}`
      ].join(' ')
    )
    advance(3)
  }

  // subsequent curves
  while (rn >= 2) {
    d.push(
      [
        'S',
        `${curve[pi].x},${curve[pi].y}`,
        `${curve[pi+1].x},${curve[pi+1].y}`
      ].join(' ')
    )
    advance(2)
  }

  // skip remainder
  
  // return path
  return d.join(' ')
}

/**
 * @param d svg.path.d expression of a curve/spline.
 */
export function svgPathDToCurve(d: string) {
  const ctrlCoords = d.replaceAll(/[MCSQL][,\s]+/g, '').split(/[ ,]+/g)

  return Group.fromPtArray(
    // convert coordinates to list of control points
    ctrlCoords.map((cc, ci, ca) => {
      if (ci % 2 === 0) {
        return new Pt(parseFloat(cc), parseFloat(ca[ci+1]))
      }
      else {
        return undefined
      }
    })
    .filter(p => p !== undefined)
  )
}

export function cycleIndex(idx: number, len: number) {
  idx = idx % len

  if (idx < 0) {
    idx = len + idx
  }

  return idx
}