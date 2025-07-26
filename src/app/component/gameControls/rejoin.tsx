import { GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { joinGame } from '@lib/page'
import { RefObject, useContext, useEffect, useState } from 'react'
import { Plugin } from 'react-bootstrap-icons'
import getStrings, { StringsNamespace } from '@lib/strings'
import { LocaleCtx } from '@component/context'

export default function RejoinGame(
  { game, clientDeviceId, gameEventSource, onGameEvent, closeGameEventSource }: {
    game: StaticRef<Game> | RefObject<Game>,
    clientDeviceId: StaticRef<string> | RefObject<string>
    gameEventSource: RefObject<EventSource | undefined>
    onGameEvent: RefObject<(e: MessageEvent, onJoin: () => void) => void>
    closeGameEventSource: RefObject<() => void>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.RejoinGame)
  const [joinedGame, setJoinedGame] = useState(false)

  useEffect(
    () => {
      game.current.addStateListener(GameStateListenerKey.Joined, RejoinGame.name, setJoinedGame)
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
          joinGame(game.current, false, clientDeviceId.current, false, gameEventSource, onGameEvent.current, closeGameEventSource.current)
          .then(() => {
            game.current.setJoined(true)
          })
        }}
        title={s('title')} >
        <Plugin />
      </button>
    </div>
  )
}