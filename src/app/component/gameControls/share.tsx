import GameLink from '@component/gameLink/gameLink'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject } from 'react'
import { Share } from 'react-bootstrap-icons'

export default function ShareGame(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  return (
    <GameLink 
      title='Share game link to add devices to the board.'
      icon={<Share/>}
      updateUrl={(url) => {
        const shareUrlParams = new URLSearchParams()
        Game.saveGameId(game.current.id, shareUrlParams)
        
        url.search = shareUrlParams.toString()
      }} />
  )
}
