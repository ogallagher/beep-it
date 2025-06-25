import { JSX, RefObject, useEffect, useState } from 'react'
import Grid from '@component/grid'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { BoardDisplayMode, GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import Widget from '@lib/widget/widget'
import WidgetCmp from './widget/widgetCmp'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'

export default function Board(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {

  const [gameStarted, setGameStarted] = useState(game.current.getStarted())
  const [renderedWidgets, setRenderedWidgets] = useState([] as Widget[])

  /**
   * Place subset of game widgets on board within local device viewport.
   */
  function placeWidgets() {
    // widgets in insert order
    const widgets = [...game.current.config.widgets.values()]

    if (game.current.config.boardDisplayMode === BoardDisplayMode.Mirror) {
      // show all widgets in each device
      setRenderedWidgets(widgets)
    }
    else {
      // show subset of widgets in each device
      const devices = [...game.current.getDevices()].toSorted()
      const renderedWidgets: Widget[] = []

      for (let widgetIdx = 0; widgetIdx < widgets.length; widgetIdx++) {
        const deviceIdx = widgetIdx % Math.max(devices.length, 1)

        if (devices[deviceIdx] === deviceId.current) {
          renderedWidgets.push(widgets[widgetIdx])
        }
        // else, widget is shown in another device

        setRenderedWidgets(renderedWidgets)
      }
    }
  }

  function deleteWidget(id: string) {
    // update local game model and render
    game.current.deleteWidget(id)

    // send config event to server
    clientSendConfigEvent({
      gameEventType: GameEventType.Config,
      gameId: game.current.id,
      deviceId: deviceId.current,
      widgets: [...game.current.config.widgets.values()]
    })
  }

  function renderWidget(widget: Widget): JSX.Element {
    return WidgetCmp({
      widget: widget.save(),
      labelEditable: !gameStarted,
      // widget can delete itself from the board
      onDelete: deleteWidget
    })
  }

  // register game update listeners
  useEffect(
    () => {
      // disable input on game start
      game.current.addStateListener(GameStateListenerKey.Started, setGameStarted)

      // render widgets
      game.current.addConfigListener(GameConfigListenerKey.Widgets, placeWidgets)
    },
    [ game ]
  )

  return (
    <div className='bg-fuchsia-900 w-full h-dvh' >
      <Grid>
        {renderedWidgets.map(renderWidget)}
      </Grid>
    </div>
  )
}