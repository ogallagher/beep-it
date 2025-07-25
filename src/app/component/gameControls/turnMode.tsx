import { RefObject, useContext, useEffect, useState } from 'react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { GameTurnMode, GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import { ArrowsAngleContract, ArrowsAngleExpand } from 'react-bootstrap-icons'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { LocaleCtx } from '@component/context'
import getStrings, { StringsNamespace } from '@lib/strings'

export default function TurnMode(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.TurnMode)
  const [turnMode, setTurnMode] = useState(game.current.config.gameTurnMode)
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())
  const [gameEnded, setGameEnded] = useState(game.current.getEnded())

  useEffect(
    () => {
      // render turn mode
      game.current.addConfigListener(GameConfigListenerKey.GameTurnMode, TurnMode.name, setTurnMode)
      // disable/enable input on game start/end
      game.current.addStateListener(GameStateListenerKey.Started, TurnMode.name, setGameStarted)
      game.current.addStateListener(GameStateListenerKey.Ended, TurnMode.name, setGameEnded)
    },
    [ game ]
  )

  function onClick() {
    // update local game model and render new value
    game.current.setTurnMode(
      turnMode === GameTurnMode.Competitive
      ? GameTurnMode.Collaborative
      : GameTurnMode.Competitive
    )

    // send config event to server
    clientSendConfigEvent({
      gameEventType: GameEventType.Config,
      gameId: game.current.id,
      deviceId: deviceId.current,
      gameTurnMode: game.current.config.gameTurnMode
    })
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
        <div>{s('turnMode')}:</div>

        <div className="font-bold">
          {game.current.config.gameTurnMode === GameTurnMode.Competitive ? s('compete') : s('collab')}
        </div>

        <button 
          className={
            (
              gameStarted && !gameEnded
              ? 'cursor-default' 
              : 'hover:scale-105 cursor-pointer'
            )
          }
          type='button' onClick={onClick}
          disabled={gameStarted && !gameEnded ? true : undefined}
          title={
            game.current.config.gameTurnMode === GameTurnMode.Competitive 
            ? s('competeTitle') 
            : s('collabTitle')
          } >
          {game.current.config.gameTurnMode === GameTurnMode.Competitive ? <ArrowsAngleExpand /> : <ArrowsAngleContract />}
        </button>
      </div>
    </div>
  )
}