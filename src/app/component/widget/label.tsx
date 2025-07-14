'use client'

import { Input } from '@headlessui/react'
import { DeviceId, GameConfigListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import StaticRef from '@lib/staticRef'
import { WidgetId } from '@lib/widget/const'
import { RefObject, useEffect, useState } from 'react'
import { ChatSquare, ChatSquareDots } from 'react-bootstrap-icons'

export default function WidgetLabel(
  { widgetId, valueRef, disabled, game, deviceId }: {
    widgetId: WidgetId
    valueRef: RefObject<string> | StaticRef<string>
    disabled: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<DeviceId> | RefObject<DeviceId>
  }
) {
  const [labelValue, setLabelValue] = useState(valueRef.current)
  const [showLabel, setShowLabel] = useState(() => {
    const widget = game.current.config.widgets.get(widgetId)
    if (widget) {
      return widget.showLabel
    }
    else {
      return true
    }
  })

  useEffect(
    () => {
      setLabelValue(valueRef.current)
    },
    [ valueRef ]
  )

  useEffect(
    () => {
      game.current.addConfigListener(
        GameConfigListenerKey.Widgets,
        `${WidgetLabel.name}.${widgetId}`,
        () => {
          // persist game.widget model changes to component
          const widget = game.current.config.widgets.get(widgetId)
          if (widget !== undefined) {
            setShowLabel(widget.showLabel)
          }
        },
        widgetId
      )
    },
     [ game ]
  )

  /**
   * Persist widget label update to game model.
   */
  function changeLabel(showLabel: boolean) {
    valueRef.current = labelValue
    const widget = game.current.config.widgets.get(widgetId)

    if (widget !== undefined) {
      widget.label = valueRef.current
      widget.showLabel = showLabel
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
    <div className='w-full flex flex-row justify-center pt-1 gap-2'>
      <Input
        className={
          'block rounded-lg px-3 py-1.5 bg-white/5 text-white not-dark:text-black text-center flex-1 '
          + (showLabel ? '' : 'hidden')
        }
        value={labelValue} 
        size={labelValue.length}
        onChange={e => setLabelValue(e.target.value)}
        onBlur={() => changeLabel(showLabel)}
        disabled={disabled} />

      <div className={
        'flex flex-col justify-center text-2xl pr-1 '
         + (disabled ? 'hidden' : '')
      }>
        <button
          className='cursor-pointer hover:scale-105' type='button'
          onClick={() => {
            const _showLabel = !showLabel
            // update component state
            setShowLabel(_showLabel)
            // persist to game model
            changeLabel(_showLabel)
          }}
          title='Toggle show widget label.' >
          {showLabel ? <ChatSquare /> : <ChatSquareDots />}
        </button>
      </div>
    </div>
  )
}