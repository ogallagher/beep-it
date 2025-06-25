'use client'

import { RefObject } from 'react'
import { Field, Input, Label } from '@headlessui/react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'

interface Config {
  command: string
}

export default function WidgetConfig(
  {widgetId, configRef, disabled, game, deviceId}: {
    widgetId: string
    configRef: RefObject<Config> | StaticRef<Config>
    disabled: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  /**
   * Persist widget command update to game model.
   */
  function changeCommand() {
    const widget = game.current.config.widgets.get(widgetId)

    if (widget !== undefined) {
      widget.command = configRef.current.command
      // send config event to server
      clientSendConfigEvent({
        gameEventType: GameEventType.Config,
        gameId: game.current.id,
        deviceId: deviceId.current,
        widgets: [...game.current.config.widgets.values()]
      })
    }
    // else not in game; assume within widgets drawer as template
  }

  return (
    <div
      className={disabled ? 'hidden' : ''}>
      <div>TODO color</div>
      <div>TODO duration</div>
      <div className='w-full'>
        <Field title='The verb/action done to this widget.'>
          <Label>command</Label>
          <Input
            className='block rounded-lg px-3 py-1.5 mt-1 bg-white/5 text-white w-full'
            onChange={e => configRef.current.command = e.target.value}
            defaultValue={configRef.current.command}
            onBlur={changeCommand}
            />
        </Field>
      </div>
    </div>
  )
}