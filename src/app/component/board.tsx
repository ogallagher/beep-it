import { JSX } from 'react'
import Grid from '@component/grid'

export default function Board(
  { widgets }: {
    widgets: JSX.Element[]
  }
) {
  return (
    <div className='bg-fuchsia-900 w-full h-dvh' >
      <Grid>
        {widgets}
      </Grid>
    </div>
  )
}