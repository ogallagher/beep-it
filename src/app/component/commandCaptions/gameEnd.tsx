import { LocaleCtx } from '@component/context'
import { GameConfigListenerKey, GameTurnMode } from '@lib/game/const'
import Game from '@lib/game/game'
import { GameEndReason } from '@lib/game/gameEvent'
import StaticRef from '@lib/staticRef'
import getStrings, { getFormatters, StringsNamespace } from '@lib/strings'
import { RefObject, useContext, useEffect, useState } from 'react'

export default function GameEnd(
  { game, ended, endReason, playersEliminatedCount }: {
    game: StaticRef<Game> | RefObject<Game>
    ended: boolean
    endReason: string
    playersEliminatedCount: number
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.GameEnd)
  const f = getFormatters(locale, StringsNamespace.GameEnd)

  const [totalPlayerCount, setTotalPlayerCount] = useState(() => game.current.getPlayerCount())
  const [turnMode, setTurnMode] = useState(() => game.current.config.gameTurnMode)

  useEffect(
    () => {
      // config listener for player count
      game.current.addConfigListener(GameConfigListenerKey.PlayersCount, GameEnd.name, (playersCount) => {
        setTotalPlayerCount(playersCount as number)
      })
      // for turn mode
      game.current.addConfigListener(GameConfigListenerKey.GameTurnMode, GameEnd.name, (turnMode) => {
        setTurnMode(turnMode as GameTurnMode)
      })
    },
    [ game ]
  )

  return (
    <div 
      className={
        'flex flex-row gap-2 justify-center text-right '
        + (ended ? '' : 'hidden')
      } >
      <div className='flex flex-col justify-center'>
        <div className='font-bold text-2xl'>
          {
            (totalPlayerCount - playersEliminatedCount <= 1 || turnMode === GameTurnMode.Collaborative)
            // end game
            ? s('over')
            // end round
            : f('roundOver')(playersEliminatedCount.toString())
          }
        </div>
      </div>
      <div className='flex flex-col justify-center'>
        <div className='text-1xl'>
          ({ ( () => {
            switch (endReason) {
              case GameEndReason.StartDelay:
                return s('startDelay')
              case GameEndReason.ActionDelay:
                return s('actionDelay')
              case GameEndReason.ActionMismatch:
                return s('actionMismatch')
              case GameEndReason.Reset:
                return s('reset')
              case GameEndReason.Unknown:
              default:
                return s('unknown')
            }
          } )() })
        </div>
      </div>
    </div>
  )
}