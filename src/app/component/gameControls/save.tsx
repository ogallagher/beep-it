import { LocaleCtx } from '@component/context'
import GameLink from '@component/gameControls/gameLink'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import getStrings, { StringsNamespace } from '@lib/strings'
import { RefObject, useContext } from 'react'
import { BookmarkPlus } from 'react-bootstrap-icons'

export default function SaveConfig(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.Save)
  
  return (
    <GameLink 
      title={s('title')}
      icon={<BookmarkPlus/>}
      updateUrl={(url) => {
        const saveUrlParams = game.current.save()
        url.search = saveUrlParams.toString()
      }} />
  )
}