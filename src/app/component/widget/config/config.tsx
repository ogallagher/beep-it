'use client'

import { RefObject, useContext, useEffect, useState } from 'react'
import { Field, Input, Label } from '@headlessui/react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { WidgetConfig, WidgetId, WidgetType } from '@lib/widget/const'
import WidgetCommand from './command'
import { DeviceId, GameConfigListenerKey } from '@lib/game/const'
import getStrings, { StringsNamespace } from '@lib/strings'
import { LocaleCtx } from '@component/context'

export default function WidgetConfigCmp(
  {widgetId, widgetType, configRef, showColor, showValueText, showWidth, disabled, reduced, game, deviceId, commandAudioEnabled}: {
    widgetId: WidgetId
    widgetType: WidgetType
    configRef: RefObject<WidgetConfig> | StaticRef<WidgetConfig>
    showColor: RefObject<CallableFunction> | StaticRef<CallableFunction>
    /**
     * Reference to callback that updates valueText in control icon.
     */
    showValueText: RefObject<CallableFunction> | StaticRef<CallableFunction>
    showWidth: RefObject<CallableFunction> | StaticRef<CallableFunction>
    disabled: boolean
    reduced: boolean
    game: RefObject<Game> | StaticRef<Game>
    deviceId: StaticRef<DeviceId> | RefObject<DeviceId>
    commandAudioEnabled: boolean
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.WidgetConfig)
  const [valueText, setValueText] = useState(configRef.current.valueText)
  const [color, setColor] = useState(configRef.current.color)
  const [width, setWidth] = useState(configRef.current.width)
  const [duration, setDuration] = useState(configRef.current.duration)

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
      widget.duration = configRef.current.duration

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
        `${WidgetConfigCmp.name}.${widgetId}`,
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
            setDuration(widget.duration)
            // command child component is updated separately.
          }
        },
        widgetId
      )
    },
    [ game ]
  )

  return (
    <>
      {/* full config */}
      <div
        className={
          'flex flex-1 flex-col justify-evenly gap-2 '
          + (disabled || reduced ? 'hidden' : '')
        }>
        {/* valueText */}
        <Field 
          title={( () => {
            switch (widgetType) {
              case WidgetType.Lever:
                return s('valueText.lever')
              case WidgetType.Path:
                return s('valueText.path')
              default:
                return s('valueText.default')
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
                    return s('valueLabel.lever')
                  case WidgetType.Key:
                    return s('valueLabel.key')
                  case WidgetType.KeyPad:
                    return s('valueLabel.keypad')
                  case WidgetType.Path:
                    return s('valueLabel.path')
                  default:
                    return ''
                }
              } )()}
            </div>
          </Label>
          <Input 
            className={
              'rounded-lg px-3 py-1.5 font-mono bg-white/5 text-white '
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
            type='text' 
            maxLength={
              widgetType === WidgetType.KeyPad || widgetType === WidgetType.Path ? undefined : 1
            }
            value={valueText}
            onBlur={setConfig.current} />
        </Field>

        {/* color */}
        <Field 
          title={s('color.title')}
          className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
          <Label className='flex flex-col justify-center'>
            <div>{s('color.label')}</div>
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
          title={s('width.title')}
          className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
          <Label className='flex flex-col justify-center'>
            <div>{s('width.label')}</div>
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
            // onBlur doesn't work for range inputs on some touch screens
            onMouseUp={setConfig.current} onTouchEnd={setConfig.current} />
        </Field>

        {/* duration */}
        <Field 
          title={s('duration.title')}
          className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
          <Label className='flex flex-col justify-center'>
            <div>{s('duration.label')}</div>
          </Label>
          <Input 
            className='rounded-lg px-3 py-1.5 bg-white/5 text-white text-left'
            onChange={e => {
              const d = parseFloat(e.target.value) * 1000
              // component state
              setDuration(d)
              // model
              configRef.current.duration = d
            }}
            type='number' min={0} max={3600} step={0.1}
            value={duration / 1000}
            onBlur={setConfig.current} />
          <div className='flex flex-col justify-center'>
            <div>{s('duration.unitSecond')}</div>
          </div>
        </Field>

        {/* command */}
        <div className='w-full'>
          <WidgetCommand 
            game={game} widgetId={widgetId}
            config={configRef} setConfig={setConfig}
            audioConfigurable={commandAudioEnabled} />
        </div>
      </div>
      
      {/* reduced inputs */}
      <div 
        className={
          'absolute w-full z-10 p-2 '
          + (reduced && !disabled ? '' : 'hidden')
        } >
        <Input
          className='w-full'
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
          onMouseUp={setConfig.current} onTouchEnd={setConfig.current} />
      </div>
      
    </>
  )
}