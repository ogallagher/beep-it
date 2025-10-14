import { LocaleCtx } from '@component/context'
import { GameConfigListenerKey, GameStateListenerKey, GameTurnMode } from '@lib/game/const'
import Game from '@lib/game/game'
import { clientSendEndEvent, GameEndReason, GameEventType } from '@lib/game/gameEvent'
import StaticRef from '@lib/staticRef'
import getStrings, { StringsNamespace } from '@lib/strings'
import { RefObject, useContext, useEffect, useState } from 'react'
import { ArrowClockwise } from 'react-bootstrap-icons'

export default function GameResetRounds(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.GameResetRounds)
  function getEnable() {
    const totalPlayerCount = game.current.getPlayerCount()

    return (
      // before start or after end
      (!game.current.getStarted() || game.current.getEnded())
      // client joined the game
      && game.current.getJoined()
      // turn mode competitive for multi round player elimination 
      && game.current.config.gameTurnMode === GameTurnMode.Competitive
      // more than 1 player total
      && totalPlayerCount > 1
      // at least 1 player eliminated (not already first round)
      && game.current.getPlayersEliminatedCount() > 0
    )
  }
  const [enable, setEnable] = useState(getEnable)

  function onClick() {
    // update local game model and render new value
    game.current.setPlayersEliminatedCount(0)

    // send end-reset event to server
    clientSendEndEvent({
      gameEventType: GameEventType.End,
      gameId: game.current.id,
      deviceId: deviceId.current,
      commandCount: game.current.getCommandCount(),
      endReason: GameEndReason.Reset,
      playersEliminatedCount: game.current.getPlayersEliminatedCount()
    })
  }

  useEffect(
    () => {
      function updateEnable() {
        setEnable(getEnable())
      }

      // state event listener for start
      game.current.addStateListener(GameStateListenerKey.Started, GameResetRounds.name, updateEnable)
      // for end
      game.current.addStateListener(GameStateListenerKey.Ended, GameResetRounds.name, updateEnable)
      // for join
      game.current.addStateListener(GameStateListenerKey.Joined, GameResetRounds.name, updateEnable)
      // config listener for turn mode
      game.current.addConfigListener(GameConfigListenerKey.GameTurnMode, GameResetRounds.name, updateEnable)
      // for player count
      game.current.addConfigListener(GameConfigListenerKey.PlayersCount, GameResetRounds.name, updateEnable)
    },
    [ game ]
  )

  return (
    <div 
      className={
        'flex flex-col justify-center '
        + (enable ? '' : 'hidden')
      }
      title={s('resetRoundsTitle')} >
      <button
        className='cursor-pointer hover:scale-105'
        type='button' onClick={onClick}
        disabled={enable ? undefined : true} >
        <ArrowClockwise />
      </button>
    </div>
  )
}