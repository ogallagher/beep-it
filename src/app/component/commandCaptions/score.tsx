import { LocaleCtx } from '@component/context'
import getStrings, { StringsNamespace } from '@lib/strings'
import { useContext } from 'react'
import { Gem } from 'react-bootstrap-icons'

export default function Score(
  { score }: {
    score: number
  }
) {
  const s = getStrings(useContext(LocaleCtx), StringsNamespace.Score)
  
  return (
    <div className='flex flex-col sm:text-2xl' title={s('score')}>
      <div className='flex flex-row gap-2'>
        <div className='flex flex-col justify-center sm:text-xl'>
          {/* icon suggestions: coin, star, stars, speedometer, suit-diamond, gem */}
          <Gem />
        </div>
        
        <div className='flex flex-col font-mono justify-center'>
          {score}
        </div>
      </div>
    </div>
  )
}