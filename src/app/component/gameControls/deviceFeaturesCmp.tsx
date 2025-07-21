import { HasDeviceFeaturesCtx } from '@component/context'
import { getHasKeyboard, hasKeyboardDefault, setHasKeyboard } from '@lib/deviceFeatures'
import { useContext, useEffect, useState } from 'react'
import { Keyboard, Phone } from 'react-bootstrap-icons'

export default function DeviceFeaturesCmp() {
  const hasDeviceFeatures = useContext(HasDeviceFeaturesCtx)
  const [useKeyboard, setUseKeyboard] = useState(hasDeviceFeatures ? getHasKeyboard() : hasKeyboardDefault)
  
  useEffect(
    () => {
      if (hasDeviceFeatures) {
        setUseKeyboard(getHasKeyboard())
      }
    },
    [hasDeviceFeatures]
  )

  return (
    <button
      className='cursor-pointer hover:scale-105'
      title={useKeyboard ? 'use physical keyboard' : 'use touch screen'}
      type='button'
      onClick={() => {
        const _useKeyboard = !useKeyboard
        setUseKeyboard(_useKeyboard)
        setHasKeyboard(_useKeyboard)
      }} >
      {useKeyboard ? <Keyboard /> : <Phone />}
    </button>
  )
}