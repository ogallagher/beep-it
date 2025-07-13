import { JSX } from 'react'

export default function Grid(
  { children, className, viewportAspectRatio }: {
    children: JSX.Element[],
    className?: string,
    viewportAspectRatio?: number
  }
) {
  let screenAspectRatio = 1
  if (viewportAspectRatio !== undefined) {
    screenAspectRatio = viewportAspectRatio
  }
  else {
    try {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      screenAspectRatio = screenWidth / screenHeight
    }
    catch (_err) {
      // DOM not ready; assume dimensions
    }
  }

  // a = aspectRatio; r = rowCount; n = widgets.length; a*r * r = n
  const rowCount = Math.ceil(Math.sqrt(children.length / screenAspectRatio))
  const rowLength = Math.ceil(children.length / rowCount)

  const rows = new Array(rowCount)
  let c = 0
  for (let r=0; r < rowCount; r++) {
    rows[r] = (
      <div
        key={`row-${r}`}
        className='flex flex-wrap gap-1 justify-center' >
        {children.slice(c, c+rowLength)}
      </div>
    )

    c += rowLength
  }

  return (
    <div className={className === undefined ? '' : className} >
      {rows}
    </div>
  )
}