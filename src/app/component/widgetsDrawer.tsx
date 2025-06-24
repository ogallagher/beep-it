import { JSX } from 'react'
import Grid from '@component/grid'

export default function WidgetsDrawer(
  { widgets, open }: {
    widgets: JSX.Element[]
    open: boolean
  }
) {
  return (
    <div
      className={(open ? '' : 'hidden') + ' w-full'}>
      <Grid>
        {widgets}
      </Grid>
    </div>
  )
}