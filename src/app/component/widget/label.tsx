'use client'

import { Input } from '@headlessui/react'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useState } from 'react'

export default function WidgetLabel(
  { widgetId, valueRef, disabled, game, deviceId }: {
    widgetId: string
    valueRef: RefObject<string> | StaticRef<string>
    disabled: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const [labelValue, setLabelValue] = useState(valueRef.current)
  useEffect(
    () => {
      setLabelValue(valueRef.current)
    },
    [ valueRef ]
  )

  /**
   * Persist widget label update to game model.
   */
  function changeLabel() {
    valueRef.current = labelValue
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
        className={
          'block rounded-lg px-3 py-1.5 bg-white/5 text-white not-dark:text-black text-center w-full '
          + (disabled ? '' : 'mt-1')
        }
        value={labelValue} onChange={e => setLabelValue(e.target.value)}
        onBlur={changeLabel}
        disabled={disabled} />
    </div>
  )
}