import { LocaleCtx } from '@component/context'
import Game from '@lib/game/game'
import getStrings, { StringsNamespace } from '@lib/strings'
import { generateRandomWidget } from '@lib/widget/random'
import { RefObject, useContext } from 'react'
import { LightningFill } from 'react-bootstrap-icons'

export default function RandomWidget(
  { game, deviceId }: {
    game: RefObject<Game>
    deviceId: RefObject<string>
  }
) {
  const locale = useContext(LocaleCtx)
  const s = getStrings(locale, StringsNamespace.RandomWidget)

  return (
    <div 
      className='flex flex-col justify-center' >
      <button
        className='cursor-pointer hover:scale-105' type='button'
        onClick={() => generateRandomWidget(game, deviceId)}
        title={s('title')} >
        <LightningFill />
      </button>
    </div>
  )
}