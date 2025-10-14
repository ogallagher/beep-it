import { RefObject, useContext, useEffect, useState } from 'react'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { GameConfigListenerKey, GameStateListenerKey, GameTurnMode } from '@lib/game/const'
import { Person } from 'react-bootstrap-icons'
import getStrings, { StringsNamespace } from '@lib/strings'
import { LocaleCtx } from '@component/context'

export default function Turn(
  { game, gameEnded, playersEliminatedCount }: {
    game: StaticRef<Game> | RefObject<Game>
    gameEnded: boolean
    playersEliminatedCount: number
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.Turn)
  function getTurn() {
    return {
      playerIdx: game.current.getTurnPlayerIdx(),
      commandCountTotal: game.current.getTurnCommandCountTotal(),
      commandCount: game.current.getTurnCommandCount()
    }
  }
  
  const [gameStarted, setGameStarted] = useState(() => game.current.getStarted())
  const [turnMode, setTurnMode] = useState(() => game.current.config.gameTurnMode)
  const [turn, setTurn] = useState(getTurn)
  const [playersCount, setPlayersCount] = useState(() => game.current.getPlayerCount())

  useEffect(
    () => {
      // config listener for turn mode
      game.current.addConfigListener(GameConfigListenerKey.GameTurnMode, Turn.name, (turnMode) => {
        setTurnMode(turnMode as GameTurnMode)
      })
      // for player count
      game.current.addConfigListener(GameConfigListenerKey.PlayersCount, Turn.name, (playersCount) => {
        setPlayersCount(playersCount as number)
      })

      // state listener for game start
      game.current.addStateListener(GameStateListenerKey.Started, Turn.name, (gameStarted) => {
        setGameStarted(gameStarted as boolean)
      })
      // for turn
      game.current.addStateListener(GameStateListenerKey.TurnPlayerIdx, Turn.name, () => {
        setTurn(getTurn())
      })
    },
    [ game ]
  )

  return (
    <div 
      className={
        'flex flex-col '
        + (turnMode === GameTurnMode.Competitive ? '' : 'hidden')
      }
      title={s('turnTitle')} >
      <div className='flex flex-row gap-2 text-2xl'>
        {/* turn player label */}
        <div 
          className='flex flex-col justify-center' >
          <Person />
        </div>

        {/* turn progress */}
        <div
          className={
            'flex flex-col justify-center '
            // show if game is active
            + (gameEnded || !gameStarted ? 'hidden' : '')
          } >
          <progress 
            max={turn.commandCountTotal} value={turn.commandCount} 
            className='w-10 md:w-20' />
        </div>

        {/* turn player value, remaining players */}
        <div 
          className='flex flex-col font-mono' >
          <span className='text-nowrap'>
            <b>{turn.playerIdx + 1}</b>
            {' / '}
            <span title={s('playersRemainingTitle')}>
              {playersCount - playersEliminatedCount}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}