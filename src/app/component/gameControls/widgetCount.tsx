import { GameConfigListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useState } from 'react'

export default function WidgetCount(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [widgetCount, setWidgetCount] = useState(game.current.config.widgets.size)

  useEffect(
    () => {
      game.current.addConfigListener(GameConfigListenerKey.Widgets, WidgetCount.name, () => {
        setWidgetCount(game.current.config.widgets.size)
      })
    },
    [ game ]
  )

  return (
    <div className="p-2 font-bold font-mono" title='count of widgets in the board'>
      {widgetCount}
    </div>
  )
}