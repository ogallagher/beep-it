'use client'

import { RefObject } from 'react'
import { Field, Input, Label } from '@headlessui/react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { WidgetType } from '@lib/widget/const'

export interface Config {
  command: string
  valueText?: string
}

export default function WidgetConfig(
  {widgetId, widgetType, configRef, showValueText, disabled, game, deviceId}: {
    widgetId: string
    widgetType: WidgetType
    configRef: RefObject<Config> | StaticRef<Config>
    showValueText: RefObject<CallableFunction> | StaticRef<CallableFunction>
    disabled: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  /**
   * Persist widget command update to game model.
   */
  function change() {
    const widget = game.current.config.widgets.get(widgetId)

    if (widget !== undefined) {
      widget.command = configRef.current.command
      widget.valueText = configRef.current.valueText

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
      className={
        'flex flex-col gap-2 '
        + (disabled ? 'hidden' : '')
      }>
      <Field 
        title='The text value of this widget.'
        className={
          'w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1 '
          + (configRef.current.valueText === undefined ? 'hidden' : '')
        } >
        <Label className='flex flex-col justify-center'>
          <div >
            {( () => {
              switch (widgetType) {
                case WidgetType.Key:
                  return 'key value'
                case WidgetType.KeyPad:
                  return 'text' 
                default:
                  return ''
              }
            } )()}
          </div>
        </Label>
        <Input 
          className={
            'rounded-lg px-3 py-1.5 bg-white/5 text-white '
            + (widgetType === WidgetType.Key ? 'w-10 text-center' : 'text-left')
          }
          onChange={e => {
            // source of truth to update game model on submit
            configRef.current.valueText = e.target.value
            // callback to update synced UI components
            showValueText.current(e.target.value)
          }}
          type='text' maxLength={1} minLength={1}
          defaultValue={configRef.current.valueText}
          onBlur={change} />
      </Field>
      <div>TODO color</div>
      <div>TODO duration</div>
      <div className='w-full'>
        <Field 
          title='The verb/action done to this widget.'
          className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
          <Label className='flex flex-col justify-center'>
            <div>command</div>
          </Label>
          <Input
            className='block rounded-lg px-3 py-1.5 bg-white/5 text-white'
            onChange={e => configRef.current.command = e.target.value}
            defaultValue={configRef.current.command}
            onBlur={change}
            />
        </Field>
      </div>
    </div>
  )
}