import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useState } from 'react'

export default function CommandCaptions(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  function getCommand() {
    const commandWidgetId = game.current.getCommandWidgetId()
    if (commandWidgetId === undefined) {
      return undefined
    }
    return {
      action: game.current.config.widgets.get(commandWidgetId)?.command,
      targetLabel: game.current.config.widgets.get(commandWidgetId)?.label
    }
  }
  const [command, setCommand] = useState(getCommand())

  useEffect(
    () => {
      // state listener for command
      game.current.addStateListener(GameStateListenerKey.CommandWidgetId, () => setCommand(getCommand()))
    },
    [ game ]
  )

  return (
    <div 
      className={
        'text-center w-full bg-orange-900 p-4 '
        + (command === undefined ? 'hidden' : '')
      } >
      <div className='flex flex-row gap-2 justify-center'>
        <div className='flex flex-col justify-center'>
          <div className='font-bold text-3xl'>{command?.action}</div>
        </div>
        <div className='flex flex-col justify-center'>
          <div className='text-2xl'>{command?.targetLabel}</div>
        </div>
      </div>
    </div>
  )
}