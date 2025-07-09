import { GameConfigListenerKey, GameStateListenerKey } from 'app/_lib/game/const'
import Game from 'app/_lib/game/game'
import StaticRef from 'app/_lib/staticRef'
import { RefObject, useEffect, useState } from 'react'
import { PlayCircle } from 'react-bootstrap-icons'

export default function GamePlay(
  { startGame, game }: {
    startGame: () => void
    game: StaticRef<Game> | RefObject<Game>
  }
) {
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
      game.current.addConfigListener(GameConfigListenerKey.Widgets, updateEnable)
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
        title='Start new game'
        disabled={enable ? undefined : true} >
        <PlayCircle />
      </button>
    </div>
  )
}