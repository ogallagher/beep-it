import Game from '@lib/game/game'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { crossPlatformWidgetTypes, defaultWidgetCommands, defaultWidgetLabel } from '@lib/widget/const'
import Widget from '@lib/widget/widget'
import { RefObject } from 'react'
import { LightningFill } from 'react-bootstrap-icons'

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

function generateRandomWidget(game: RefObject<Game>, deviceId: RefObject<string>) {
  const type = crossPlatformWidgetTypes[Math.trunc(Math.random() * crossPlatformWidgetTypes.length)]
  const widget = Widget.new(type)

  // color
  const colorNameKeys = Object.keys(colorNames)
  const colorNameKey = colorNameKeys[Math.trunc(Math.random() * colorNameKeys.length)]
  widget.color = colorNames[colorNameKey]
  // label matching color
  widget.label = `${colorNameKey} ${defaultWidgetLabel(type)}`
  // duration
  widget.duration = Math.round(Math.random() * 3000)
  // command
  const commands = defaultWidgetCommands(type)
  widget.command = commands[Math.trunc(Math.random() * commands.length)]

  // update local game model and render
  game.current.addWidget(widget)

  // send game config event
  clientSendConfigEvent({
    gameEventType: GameEventType.Config,
    gameId: game.current.id,
    deviceId: deviceId.current,
    widgets: [...game.current.config.widgets.values()]
  })
}

export default function RandomWidget(
  { game, deviceId }: {
    game: RefObject<Game>
    deviceId: RefObject<string>
  }
) {
  return (
    <div 
      className='flex flex-col justify-center' >
      <button
        className='cursor-pointer hover:scale-105' type='button'
        onClick={() => generateRandomWidget(game, deviceId)}
        title='Add a random widget to the board' >
        <LightningFill />
      </button>
    </div>
  )
}