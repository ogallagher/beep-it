import { GameStateListenerKey, TimeoutReference } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useRef, useState } from 'react'
import ActionText from '@component/widget/control/actionText'
import { WidgetType } from '@lib/widget/const'
import Turn from './turn'
import GameEnd from './gameEnd'
import Score from './score'

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
      delay: game.current.getCommandDelay(true),
      type: game.current.config.widgets.get(commandWidgetId)?.type
    }
  }
  function getGameEnd() {
    return {
      ended: game.current.getEnded(),
      endReason: game.current.getEndReason(),
      playersEliminatedCount: game.current.getPlayersEliminatedCount()
    }
  }
  function getScore() {
    return Math.max(0, game.current.getCommandCount()-1)
  }

  const [command, setCommand] = useState(getCommand)
  const [commandDelayProgress, setCommandDelayProgress] = useState(0)
  const commandDelayInterval = useRef(undefined as TimeoutReference)
  
  const [score, setScore] = useState(getScore)
  const [gameEnd, setGameEnd] = useState(getGameEnd)

  useEffect(
    () => {
      // state listener for command
      game.current.addStateListener(GameStateListenerKey.CommandWidgetId, CommandCaptions.name, () => {
        // latest states are not available without being useEffect dependencies,
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

      // listener for game/round end
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
        <div className='flex flex-col justify-center' >
          <div
            className={
              'sm:flex sm:flex-row gap-2 justify-center text-left '
              + (command === undefined ? 'hidden' : '')
            } >
            <div className='flex flex-col justify-center'>
              {/* command action */}
              <div className='font-bold md:text-2xl'>{command?.action}</div>
            </div>
            <div className='flex flex-col justify-center'>
              {/* command target */}
              <div className='text-sm'>{command?.targetLabel}</div>
            </div>
            
            {/* command delay */}
            <div
              className={
                'flex flex-col justify-center '
                + (command === undefined || gameEnd.ended ? 'hidden' : '')
              } >
              <progress max={command?.delay} value={commandDelayProgress}
                className='w-10 md:w-20' />
            </div>
          </div>
        </div>
        
        <div className={
          'flex flex-col justify-center text-center '
          + (command?.type === WidgetType.KeyPad && !gameEnd.ended ? 'hidden md:block' : '')
        }>
          <div className='md:flex md:flex-row gap-4'>
            {/* score */}
            <Score score={score} />

            {/* turn */}
            <Turn game={game} gameEnded={gameEnd.ended} playersEliminatedCount={gameEnd.playersEliminatedCount} />
          </div>
        </div>

        {/* action text (input progress of active keypad) */}
        <div className={
          'flex flex-col justify-center text-center '
          + (command?.type === WidgetType.KeyPad && !gameEnd.ended ? '' : 'hidden')
        }>
          <ActionText />
        </div>
        
        {/* game end */}
        <GameEnd 
          game={game}
          ended={gameEnd.ended} endReason={gameEnd.endReason}
          playersEliminatedCount={gameEnd.playersEliminatedCount} />
      </div>
    </div>
  )
}