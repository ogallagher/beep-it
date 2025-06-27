import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import { GameEndReason } from '@lib/game/gameEvent'
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
  function getGameEnd() {
    return {
      ended: game.current.getEnded(),
      endReason: game.current.getEndReason()
    }
  }

  const [command, setCommand] = useState(getCommand())
  const [gameEnd, setGameEnd] = useState(getGameEnd())

  useEffect(
    () => {
      // state listener for command
      game.current.addStateListener(GameStateListenerKey.CommandWidgetId, () => setCommand(getCommand()))
      // listener for game end
      game.current.addStateListener(GameStateListenerKey.Ended, () => setGameEnd(getGameEnd()))
    },
    []
  )

  return (
    <div 
      className='w-full px-4 pb-2 pt-8 md:pt-2' >
      <div className='flex flex-row gap-2 justify-between'>
        <div
          className={
            'flex flex-row gap-2 justify-center text-left '
            + (command === undefined ? 'hidden' : '')
          } >
          <div className='flex flex-col justify-center'>
            <div className='font-bold text-2xl'>{command?.action}</div>
          </div>
          <div className='flex flex-col justify-center'>
            <div className='text-1xl'>{command?.targetLabel}</div>
          </div>
        </div>

        <div className='flex flex-col justify-center text-center'>
          <div className='text-2xl text-nowrap'>
            <b>score: </b>[...]
          </div>
        </div>
        
        <div 
          className={
            'flex flex-row gap-2 justify-center text-right '
            + (gameEnd.ended ? '' : 'hidden')
          } >
          <div className='flex flex-col justify-center'>
            <div className='font-bold text-2xl'>Game Over</div>
          </div>
          <div className='flex flex-col justify-center'>
            <div className='text-1xl'>
              ({ ( () => {
                switch (gameEnd.endReason) {
                  case GameEndReason.StartDelay:
                    return 'game expired; reconnect devices to play'
                  case GameEndReason.ActionDelay:
                    return 'too slow'
                  case GameEndReason.ActionMismatch:
                    return 'wrong widget'
                  case GameEndReason.Unknown:
                  default:
                    return 'reason unknown'
                }
              } )() })
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}