import { RefObject, useEffect, useState } from 'react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { GameTurnMode, GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import { ArrowsAngleContract, ArrowsAngleExpand } from 'react-bootstrap-icons'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'

export default function TurnMode(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const [turnMode, setTurnMode] = useState(game.current.config.gameTurnMode)
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())

  useEffect(
    () => {
      // render turn mode
      game.current.addConfigListener(GameConfigListenerKey.GameTurnMode, setTurnMode)
      // disable input on game start
      game.current.addStateListener(GameStateListenerKey.Started, setGameStarted)
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
        <div>turn mode:</div>

        <div className="font-bold">
          {game.current.config.gameTurnMode === GameTurnMode.Competitive ? 'compete' : 'collab'}
        </div>

        <button 
          className={
            (
              gameStarted 
              ? 'cursor-default' 
              : 'hover:scale-105 cursor-pointer'
            )
          }
          type='button' onClick={onClick}
          disabled={gameStarted ? true : undefined}
          title={
            game.current.config.gameTurnMode === GameTurnMode.Competitive 
            ? 'Compete - Players take turns and loser is eliminated.' 
            : 'Collab - Any player can do a widget at any time.'
          } >
          {game.current.config.gameTurnMode === GameTurnMode.Competitive ? <ArrowsAngleExpand /> : <ArrowsAngleContract />}
        </button>
      </div>
    </div>
  )
}