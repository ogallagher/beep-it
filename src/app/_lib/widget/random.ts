import Widget from '@lib/widget/widget'
import Game from '@lib/game/game'
import { RefObject } from 'react'
import { cardinalDirections, crossPlatformWidgetTypes, defaultWidgetCommands, defaultWidgetLabel, randomChar, WidgetType } from './const'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import getStrings, { getFormatters, Locale, StringsNamespace } from '@lib/strings'

/**
 * CSS color names that a random widget can be.
 */
const colorNames: {[name: string]: string} = {
  'white': '#ffffff',
  'maroon': '#800000',
  'red': '#ff0000',
  'purple': '#800080',
  'magenta': '#ff00ff',
  'green': '#008000',
  'lime': '#00ff00',
  'olive': '#808000',
  'yellow': '#ffff00',
  'navy': '#000080',
  'blue': '#0000ff',
  'teal': '#008080',
  'aqua': '#00ffff',
  'chocolate': '#d2691e',
  'coral': '#ff7f50',
  'plum': '#dda0dd',
  'salmon': '#fa8072'
}

export function generateRandomWidget(
  game: RefObject<Game>, 
  deviceId: RefObject<string>,
  widgetIdx?: number,
  width?: number,
  locale?: Locale
) {
  const type = crossPlatformWidgetTypes[Math.trunc(Math.random() * crossPlatformWidgetTypes.length)]
  const widget = Widget.new(type, locale)

  // color
  const colorNameKeys = Object.keys(colorNames)
  const colorNameKey = colorNameKeys[Math.trunc(Math.random() * colorNameKeys.length)]
  widget.color = colorNames[colorNameKey]
  const colorName = getStrings(locale!, StringsNamespace.Color)(colorNameKey)
  // duration
  widget.duration = Math.round(Math.random() * 3000)
  // command
  const commands = defaultWidgetCommands(type, locale)
  widget.command = commands[Math.trunc(Math.random() * commands.length)]

  // value
  if (type === WidgetType.Lever) {
    // lever direction
    widget.valueText = cardinalDirections[Math.trunc(Math.random() * cardinalDirections.length)]
  }
  else if (type === WidgetType.Key) {
    widget.valueText = randomChar()
  }
  else if (type === WidgetType.KeyPad) {
    if (locale === Locale.Korean) {
      // currently cannot support multikey chars #85
      widget.valueText = colorNameKey
    }
    else {
      widget.valueText = colorName
    }
  }

  // label
  const f = getFormatters(locale!, StringsNamespace.RandomWidget)
  const _label = defaultWidgetLabel(type, locale)
  if (type === WidgetType.Lever) {
    widget.label = f('label.lever')(colorName, widget.valueText!, _label)
  }
  else if (type === WidgetType.Key) {
    widget.label = f('label.key')(widget.valueText!, _label)
  }
  else {
    widget.label = f('label.default')(colorName, _label)
  }

  // size
  if (width !== undefined) {
    widget.width = width
  }

  // update local game model and render
  game.current.addWidget(widget, widgetIdx)

  // send game config event
  clientSendConfigEvent({
    gameEventType: GameEventType.Config,
    gameId: game.current.id,
    deviceId: deviceId.current,
    widgets: [...game.current.config.widgets.values()]
  })
}