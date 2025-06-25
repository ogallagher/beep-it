'use client'

import { Input } from '@headlessui/react'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import StaticRef from '@lib/staticRef'
import { RefObject } from 'react'

export default function WidgetLabel(
  { widgetId, valueRef, disabled, game, deviceId }: {
    widgetId: string
    valueRef: RefObject<string> | StaticRef<string>
    disabled: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  /**
   * Persist widget label update to game model.
   */
  function changeLabel() {
    const widget = game.current.config.widgets.get(widgetId)

    if (widget !== undefined) {
      widget.label = valueRef.current
      // send config event to server
      clientSendConfigEvent({
        gameEventType: GameEventType.Config,
        gameId: game.current.id,
        deviceId: deviceId.current,
        widgets: [...game.current.config.widgets.values()]
      })
    }
    // else not in game
  }

  return (
    <div className='w-full flex flex-row justify-center'>
      <Input
        className='block rounded-lg px-3 py-1.5 mt-1 bg-white/5 text-white text-center w-full'
        defaultValue={valueRef.current} onChange={e => valueRef.current = e.target.value}
        onBlur={changeLabel}
        disabled={disabled} />
    </div>
  )
}