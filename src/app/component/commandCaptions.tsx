import { GameStateListenerKey, TimeoutReference } from '@lib/game/const'
import Game from '@lib/game/game'
import { GameEndReason } from '@lib/game/gameEvent'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useRef, useState } from 'react'

/**
 * Period of command delay progress update cycle, in milliseconds.
 */
const commandDelayIntervalPeriod = 100

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
      targetLabel: game.current.config.widgets.get(commandWidgetId)?.label,
      delay: game.current.getCommandDelay(true)
    }
  }
  function getGameEnd() {
    return {
      ended: game.current.getEnded(),
      endReason: game.current.getEndReason()
    }
  }

  const [command, setCommand] = useState(getCommand)
  const [commandDelayProgress, setCommandDelayProgress] = useState(0)
  const commandDelayInterval = useRef(undefined as TimeoutReference)
  function getScore() {
    return Math.max(0, game.current.getCommandCount()-1)
  }
  const [score, setScore] = useState(getScore)
  const [gameEnd, setGameEnd] = useState(getGameEnd)

  useEffect(
    () => {
      // state listener for command
      game.current.addStateListener(GameStateListenerKey.CommandWidgetId, CommandCaptions.name, () => {
        // latest states are not available without being dependencies,
        // and are not dependencies to prevent overwriting the state listener.
        // So we create local references to latest state values, similar to useRef.
        const command = getCommand()
        setCommand(command)
        setScore(getScore())

        let commandDelayProgress = 0
        setCommandDelayProgress(commandDelayProgress)
        clearInterval(commandDelayInterval.current)

        commandDelayInterval.current = setInterval(
          () => {
            commandDelayProgress += commandDelayIntervalPeriod
            if (commandDelayProgress >= command!.delay) {
              commandDelayProgress = command!.delay
              clearInterval(commandDelayInterval.current)
            }

            setCommandDelayProgress(commandDelayProgress)
          },
          commandDelayIntervalPeriod
        )
      })
      // listener for game end
      game.current.addStateListener(GameStateListenerKey.Ended, CommandCaptions.name, () => {
        setGameEnd(getGameEnd())
        clearInterval(commandDelayInterval.current)
      })
    },
    [ game ]
  )

  return (
    <div 
      className='w-full px-4 pb-2 pt-2' >
      <div className='flex flex-row gap-2 justify-between'>
        {/* command */}
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
          {/* command-action delay */}
          <div
            className={
              'flex flex-col justify-center '
              + (command === undefined || gameEnd.ended ? 'hidden' : '')
            } >
            <progress max={command?.delay} value={commandDelayProgress}
              className='w-10 md:w-20' />
          </div>
        </div>

        {/* score */}
        <div className='flex flex-col justify-center text-center'>
          <div className='text-2xl text-nowrap'>
            <b>score: </b>
            <span className='font-mono'>{score}</span>
          </div>
        </div>
        
        {/* game end */}
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