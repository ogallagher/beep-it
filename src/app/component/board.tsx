import { JSX, RefObject, useEffect, useState } from 'react'
import Grid from '@component/grid'
import Game from 'app/_lib/game/game'
import StaticRef from 'app/_lib/staticRef'
import { BoardDisplayMode, GameConfigListenerKey, GameStateListenerKey } from 'app/_lib/game/const'
import Widget from 'app/_lib/widget/widget'
import WidgetCmp from './widget/widgetCmp'
import { clientSendConfigEvent, GameEventType } from 'app/_lib/game/gameEvent'

export type BoardParams = {
  game: StaticRef<Game> | RefObject<Game>
  deviceId: StaticRef<string> | RefObject<string>
}

export default function Board({ game, deviceId }: BoardParams) {
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())
  const [gameEnded, setGameEnded] = useState(game.current.getEnded())
  const [gamePreview, setGamePreview] = useState(game.current.getPreview())
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
    const active = gameStarted && !gameEnded
    return WidgetCmp({
      widget: widget.save(),
      game: game,
      deviceId: deviceId,
      labelEditable: !active,
      configurable: (!gameStarted || gameEnded) && !gamePreview,
      active: active,
      commandAudioEnabled: true,
      // widget can delete itself from the board
      onDelete: deleteWidget
    })
  }

  // register game update listeners
  useEffect(
    () => {
      // disable widget config on game start
      game.current.addStateListener(GameStateListenerKey.Started, Board.name, setGameStarted)
      // enable widget config and disable action on game end
      game.current.addStateListener(GameStateListenerKey.Ended, Board.name, setGameEnded)
      game.current.addStateListener(GameStateListenerKey.Preview, Board.name, setGamePreview)

      // render widgets
      game.current.addConfigListener(GameConfigListenerKey.Widgets, placeWidgets)
    },
    []
  )

  return (
    <Grid>
      {renderedWidgets.map(renderWidget)}
    </Grid>
  )
}