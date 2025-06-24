import { Input } from '@headlessui/react'
import Game, {  } from '@lib/game/game'
import { GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import StaticRef from '@lib/staticRef'
import { ChangeEvent, RefObject, useEffect, useState } from 'react'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'

export default function GamePlayers(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<string> | RefObject<string>
  }
) {
  const [playerCount, setPlayerCount] = useState(game.current.getPlayerCount())
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())

  useEffect(
    () => {
      // render device count updates
      game.current.addConfigListener(GameConfigListenerKey.PlayersCount, setPlayerCount)
      // disable input on game start
      game.current.addStateListener(GameStateListenerKey.Started, setGameStarted)
    },
    [ game ]
  )

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (isNaN(e.target.valueAsNumber)) {
      console.log('skip players.count invalid NaN')
    }
    else {
      // update local game model and render new value
      game.current.setPlayerCount(e.target.valueAsNumber)

      if (game.current.getDeviceCount() > 1) {
        // send config event to server
        clientSendConfigEvent({
          gameEventType: GameEventType.Config,
          gameId: game.current.id,
          deviceId: deviceId.current,
          playerCount: game.current.config.players.count
        })
      }
    }
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
          <div className='flex flex-col justify-center'>
            <div>player count:</div>
          </div>
          <Input
            className='rounded-lg bg-white/5 text-white px-3 py-1.5 text-2xl font-bold w-20'
            disabled={gameStarted ? true : undefined}
            type='number' min={0}
            value={playerCount}
            onChange={onChange} />
      </div>
    </div>
  )
}