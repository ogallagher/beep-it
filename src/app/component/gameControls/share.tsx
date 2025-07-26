import { LocaleCtx } from '@component/context'
import GameLink from '@component/gameControls/gameLink'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import getStrings, { StringsNamespace } from '@lib/strings'
import { RefObject, useContext } from 'react'
import { Share } from 'react-bootstrap-icons'

export default function ShareGame(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.Share)
  
  return (
    <GameLink 
      title={s('title')}
      icon={<Share/>}
      updateUrl={(url) => {
        const shareUrlParams = new URLSearchParams()
        Game.saveGameId(game.current.id, shareUrlParams)
        
        url.search = shareUrlParams.toString()
      }} />
  )
}
