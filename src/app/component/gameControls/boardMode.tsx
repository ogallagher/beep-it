import { RefObject, useEffect, useState } from 'react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { BoardDisplayMode, GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import { Copy, Vr } from 'react-bootstrap-icons'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'

export default function BoardMode(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const [boardMode, setBoardMode] = useState(game.current.config.boardDisplayMode)
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())

  useEffect(
    () => {
      // render board mode
      game.current.addConfigListener(GameConfigListenerKey.BoardDisplayMode, setBoardMode)
      // disable input on game start
      game.current.addStateListener(GameStateListenerKey.Started, setGameStarted)
    },
    [ game ]
  )

  function onClick() {
    // update local game model and render new value
    game.current.setBoardDisplayMode(
      boardMode === BoardDisplayMode.Extend
      ? BoardDisplayMode.Mirror
      : BoardDisplayMode.Extend
    )

    // send config event to server
    clientSendConfigEvent({
      gameEventType: GameEventType.Config,
      gameId: game.current.id,
      deviceId: deviceId.current,
      boardDisplayMode: game.current.config.boardDisplayMode
    })
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
        <div>board mode:</div>

        <div className="font-bold">
          {game.current.config.boardDisplayMode === BoardDisplayMode.Extend ? 'extend' : 'mirror'}
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
            game.current.config.boardDisplayMode === BoardDisplayMode.Extend 
            ? 'Extend - Distribute widgets across devices as a single shared board.' 
            : 'Mirror - Each device displays its board with a copy of the widgets.'
          } >
          {game.current.config.boardDisplayMode === BoardDisplayMode.Extend ? <Vr /> : <Copy />}
        </button>
      </div>
    </div>
  )
}