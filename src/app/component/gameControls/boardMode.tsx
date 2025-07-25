import { RefObject, useContext, useEffect, useState } from 'react'
import StaticRef from '@lib/staticRef'
import Game from '@lib/game/game'
import { BoardDisplayMode, DeviceId, GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import { Copy, Vr } from 'react-bootstrap-icons'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import { LocaleCtx } from '@component/context'
import getStrings, { StringsNamespace } from '@lib/strings'

export default function BoardMode(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<DeviceId> | RefObject<DeviceId>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.BoardMode)
  const [boardMode, setBoardMode] = useState(game.current.config.boardDisplayMode)
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())
  const [gameEnded, setGameEnded] = useState(game.current.getEnded())

  useEffect(
    () => {
      // render board mode
      game.current.addConfigListener(GameConfigListenerKey.BoardDisplayMode, BoardMode.name, setBoardMode)
      // disable/enable input on game start/end
      game.current.addStateListener(GameStateListenerKey.Started, BoardMode.name, setGameStarted)
      game.current.addStateListener(GameStateListenerKey.Ended, BoardMode.name, setGameEnded)
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
        <div>{s('boardMode')}:</div>

        <div className="font-bold">
          {game.current.config.boardDisplayMode === BoardDisplayMode.Extend ? s('extend') : s('mirror')}
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
            game.current.config.boardDisplayMode === BoardDisplayMode.Extend 
            ? s('extendTitle')
            : s('mirrorTitle')
          } >
          {game.current.config.boardDisplayMode === BoardDisplayMode.Extend ? <Vr /> : <Copy />}
        </button>
      </div>
    </div>
  )
}