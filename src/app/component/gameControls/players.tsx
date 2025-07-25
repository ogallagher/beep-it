import { Input } from '@headlessui/react'
import Game from '@lib/game/game'
import { DeviceId, GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import StaticRef from '@lib/staticRef'
import { ChangeEvent, RefObject, useContext, useEffect, useState } from 'react'
import { clientSendConfigEvent, GameEventType } from '@lib/game/gameEvent'
import getStrings, { StringsNamespace } from '@lib/strings'
import { LocaleCtx } from '@component/context'

export default function GamePlayers(
  { game, deviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    deviceId: StaticRef<DeviceId> | RefObject<DeviceId>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.GamePlayers)
  const [playerCount, setPlayerCount] = useState(game.current.getPlayerCount())
  const [gameStarted, setGameStarted] = useState(game.current.getStarted())
  const [gameEnded, setGameEnded] = useState(game.current.getEnded())

  useEffect(
    () => {
      // render device count updates
      game.current.addConfigListener(GameConfigListenerKey.PlayersCount, GamePlayers.name, setPlayerCount)
      // disable input on game start and end
      game.current.addStateListener(GameStateListenerKey.Started, GamePlayers.name, setGameStarted)
      game.current.addStateListener(GameStateListenerKey.Ended, GamePlayers.name, setGameEnded)
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

      // send config event to server
      clientSendConfigEvent({
        gameEventType: GameEventType.Config,
        gameId: game.current.id,
        deviceId: deviceId.current,
        playerCount: game.current.config.players.count
      })
    }
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
          <div className='flex flex-col justify-center'>
            <div>{s('playerCount')}:</div>
          </div>
          <Input
            className='rounded-lg bg-white/5 text-white not-dark:bg-black/5 not-dark:text-black px-3 py-1.5 font-bold w-20'
            disabled={gameStarted && !gameEnded ? true : undefined}
            type='number' min={0}
            value={playerCount}
            onChange={onChange} />
      </div>
    </div>
  )
}