import GameLink from '@component/gameLink/gameLink'
import Game from '@lib/game/game'
import StaticRef from '@lib/staticRef'
import { RefObject, useRef, useState } from 'react'
import { BookmarkPlus } from 'react-bootstrap-icons'

export default function SaveConfig(
  { game }: {
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  return (
    <GameLink 
      title='Save game config link to load the same board later.'
      icon={<BookmarkPlus/>}
      updateUrl={(url) => {
        const saveUrlParams = game.current.save()
        url.search = saveUrlParams.toString()
      }} />
  )
}