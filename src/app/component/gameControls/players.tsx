import { Input } from '@headlessui/react'
import Game, {  } from '@lib/game/game'
import { GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import StaticRef from '@lib/staticRef'
import { ChangeEvent, RefObject, useEffect, useState } from 'react'
import { ApiRoute, gameServerPort } from '@api/const'
import { clientSendConfigEvent, ConfigEvent, GameEventType } from '@lib/game/gameEvent'
import assert from 'assert'

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
      // update local game model
      game.current.config.players.count = e.target.valueAsNumber

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

    // render new value
    setPlayerCount(e.target.valueAsNumber)
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
        <div>player count:</div>
        <Input
          className='rounded-lg bg-white/5 text-white px-3 py-1.5 text-lg font-bold w-20'
          disabled={gameStarted ? true : undefined}
          type='number' min={0}
          value={playerCount}
          onChange={onChange} />
      </div>
    </div>
  )
}