import Game from '@lib/game/game'
import { GameStateListenerKey } from '@lib/game/const'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useState } from 'react'

export default function GameDevices(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const [deviceCount, setDeviceCount] = useState(game.current.getDeviceCount())

  useEffect(
    () => {
      // render device count updates
      game.current.addStateListener(GameStateListenerKey.DevicesCount, setDeviceCount)
    },
    []
  )

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
        <div>device count:</div>
        <div className="font-bold">
          {deviceCount}
        </div>
      </div>
    </div>
  )
}