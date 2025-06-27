import { RefObject } from 'react'
import Grid from '@component/grid'
import { WidgetExport, widgetTypes } from '@lib/widget/const'
import WidgetCmp from './widget/widgetCmp'
import Widget from '@lib/widget/widget'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'

export default function WidgetsDrawer(
  { open, game, deviceId }: {
    open: boolean
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  function addWidget(widgetExport: WidgetExport) {
    const widget = Widget.clone(widgetExport)
    widget.label = Widget.generateLabel(widget.type, widget.id)
    // update local game model and render
    game.current.addWidget(widget)

    // send config event to server
    clientSendConfigEvent({
      gameEventType: GameEventType.Config,
      gameId: game.current.id,
      deviceId: deviceId.current,
      widgets: [...game.current.config.widgets.values()]
    })
  }

  return (
    <div
      className={
        (open ? '' : 'hidden') 
        + ' w-full px-4'
      }>
      <Grid>
        {widgetTypes.map(type => {
          const widget = Widget.new(type)
          widget.id = type
          widget.label = type

          return <WidgetCmp 
              key={type} game={game} deviceId={deviceId}
              widget={widget.save()}
              labelEditable={false}
              configurable={true}
              className='max-w-100'
              onClick={addWidget} />
        })}
      </Grid>
    </div>
  )
}