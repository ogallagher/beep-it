import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { joinGame } from 'app/page'
import { RefObject, useEffect, useState } from 'react'
import { Plugin } from 'react-bootstrap-icons'

export default function RejoinGame(
  { game, clientDeviceId, gameEventSource, onGameEvent, closeGameEventSource }: {
    game: StaticRef<Game> | RefObject<Game>,
    clientDeviceId: StaticRef<string> | RefObject<string>
    gameEventSource: RefObject<EventSource | undefined>
    onGameEvent: RefObject<(e: MessageEvent, onJoin: () => void) => void>
    closeGameEventSource: RefObject<() => void>
  }
) {
  const [joinedGame, setJoinedGame] = useState(false)

  useEffect(
    () => {
      game.current.addStateListener(GameStateListenerKey.Joined, setJoinedGame)
    },
    [ game ]
  )

  return (
    <div
      className={
        'flex flex-col justify-center '
        + (joinedGame ? 'hidden' : '')
      } >
      <button
        className='cursor-pointer hover:scale-105'
        type='button' onClick={() => {
          // assume the original game event source needs to be replaced
          closeGameEventSource.current()

          // rejoin game
          joinGame(game.current, clientDeviceId.current, false, gameEventSource, onGameEvent.current, closeGameEventSource.current)
          .then(() => {
            game.current.setJoined(true)
          })
        }}
        title='Rejoin game' >
        <Plugin />
      </button>
    </div>
  )
}