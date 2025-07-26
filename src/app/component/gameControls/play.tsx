import { LocaleCtx } from '@component/context'
import { GameConfigListenerKey, GameStateListenerKey } from '@lib/game/const'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import getStrings, { StringsNamespace } from '@lib/strings'
import { RefObject, useContext, useEffect, useState } from 'react'
import { PlayCircle } from 'react-bootstrap-icons'

export default function GamePlay(
  { startGame, game }: {
    startGame: () => void
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.Play)
  function getEnable() {
    return (
      game.current.config.widgets.size > 0
      // client joined the game
      && game.current.getJoined()
      // before start or after end, for restart
      && (!game.current.getStarted() || game.current.getEnded())
    )
  }
  const [ enable, setEnable ] = useState(getEnable)

  useEffect(
    () => {
      function updateEnable() {
        setEnable(getEnable())
      }

      // state event listener for start
      game.current.addStateListener(GameStateListenerKey.Started, GamePlay.name, updateEnable)
      // for end
      game.current.addStateListener(GameStateListenerKey.Ended, GamePlay.name, updateEnable)
      // for join (no play if not joined)
      game.current.addStateListener(GameStateListenerKey.Joined, GamePlay.name, updateEnable)
      // config event listener for widgets
      game.current.addConfigListener(GameConfigListenerKey.Widgets, GamePlay.name, updateEnable)
    },
    [ game ]
  )

  return (
    <div className={
      'flex flex-col justify-center '
      + (enable ? '' : 'hidden')
    }>
      <button
        className='cursor-pointer hover:scale-105'
        type='button' onClick={startGame}
        title={s('playTitle')}
        disabled={enable ? undefined : true} >
        <PlayCircle />
      </button>
    </div>
  )
}