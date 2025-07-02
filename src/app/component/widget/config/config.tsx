'use client'

import { RefObject, useEffect, useState } from 'react'
import { Field, Input, Label } from '@headlessui/react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { WidgetType } from '@lib/widget/const'
import WidgetCommand from './command'
import { GameConfigListenerKey } from '@lib/game/const'

export interface Config {
  command: string
  commandAudio?: string
  color: string
  valueText?: string
  width: number
}

export default function WidgetConfig(
  {widgetId, widgetType, configRef, showColor, showValueText, showWidth, disabled, game, deviceId, commandAudioEnabled}: {
    widgetId: string
    widgetType: WidgetType
    configRef: RefObject<Config> | StaticRef<Config>
    showColor: RefObject<CallableFunction> | StaticRef<CallableFunction>
    /**
     * Reference to callback that updates valueText in control icon.
     */
    showValueText: RefObject<CallableFunction> | StaticRef<CallableFunction>
    showWidth: RefObject<CallableFunction> | StaticRef<CallableFunction>
    disabled: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<string> | RefObject<string>
    commandAudioEnabled: boolean
  }
) {
  const [valueText, setValueText] = useState(configRef.current.valueText)
  const [color, setColor] = useState(configRef.current.color)
  const [width, setWidth] = useState(configRef.current.width)

  /**
   * Persist widget command update to game model.
   */
  const setConfig = new StaticRef(() => {
    const widget = game.current.config.widgets.get(widgetId)

    if (widget !== undefined) {
      widget.command = configRef.current.command
      widget.commandAudio = configRef.current.commandAudio
      widget.color = configRef.current.color
      widget.valueText = configRef.current.valueText
      widget.width = configRef.current.width

      // send config event to server
      clientSendConfigEvent({
        gameEventType: GameEventType.Config,
        gameId: game.current.id,
        deviceId: deviceId.current,
        widgets: [...game.current.config.widgets.values()]
      })
    }
    // else not in game; assume within widgets drawer as template
  })

  useEffect(
    () => {
      game.current.addConfigListener(
        GameConfigListenerKey.Widgets, 
        /**
         * Persist game.widget model changes to component and config ref.
         * Synced UI components (ex. widget control) are already updated separately.
         */
        () => {
          const widget = game.current.config.widgets.get(widgetId)
          if (widget !== undefined) {
            setValueText(widget.valueText)
            setColor(widget.color)
            setWidth(widget.width)
            // command child component is updated separately.
          }
        }
      )
    },
    [ game ]
  )

  return (
    <div
      className={
        'flex flex-col gap-2 '
        + (disabled ? 'hidden' : '')
      }>
      {/* valueText */}
      <Field 
        title={( () => {
          switch (widgetType) {
            case WidgetType.Lever:
              return 'The direction to pull.'
            default:
              return 'The text value of this widget.'
          }
        } )()}
        className={
          'w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1 '
          + (configRef.current.valueText === undefined ? 'hidden' : '')
        } >
        <Label className='flex flex-col justify-center'>
          <div >
            {( () => {
              switch (widgetType) {
                case WidgetType.Lever:
                  return 'direction'
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
            + ((widgetType === WidgetType.Lever || widgetType === WidgetType.Key) ? 'w-10 text-center' : 'text-left')
          }
          onChange={e => {
            // component state
            setValueText(e.target.value)
            // source of truth to update game model on submit
            configRef.current.valueText = e.target.value
            // callback to update synced UI components
            showValueText.current(e.target.value)
          }}
          type='text' maxLength={widgetType === WidgetType.KeyPad ? undefined : 1}
          value={valueText}
          placeholder={widgetType === WidgetType.Lever ? 'D R L U' : undefined}
          onBlur={setConfig.current} />
      </Field>

      {/* color */}
      <Field 
        title='Primary color of this widget icon.'
        className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
        <Label className='flex flex-col justify-center'>
          <div>color</div>
        </Label>
        <Input
          className='rounded-lg'
          onChange={e => {
            // component state
            setColor(e.target.value)
            // model
            configRef.current.color = e.target.value
            // synced UI components (icon)
            showColor.current(e.target.value)
          }}
          type='color'
          value={color}
          onBlur={setConfig.current} />
      </Field>

      {/* width */}
      <Field 
        title='Size of this widget icon.'
        className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
        <Label className='flex flex-col justify-center'>
          <div>size</div>
        </Label>
        <Input
          onChange={e => {
            const w = parseInt(e.target.value)
            // component state
            setWidth(w)
            // model
            configRef.current.width = w
            // synced UI components (icon)
            showWidth.current(w)
          }}
          type='range' min={5} max={100}
          value={width}
          onBlur={setConfig.current} />
      </Field>

      {/* duration */}
      <div>TODO duration</div>

      {/* command */}
      <div className='w-full'>
        <WidgetCommand 
          game={game} widgetId={widgetId}
          config={configRef} setConfig={setConfig}
          audioConfigurable={commandAudioEnabled} />
      </div>
    </div>
  )
}