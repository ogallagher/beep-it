'use client'

import { Field, Input } from '@headlessui/react'
import StaticRef from '@lib/staticRef'
import { RefObject } from 'react'

export default function WidgetLabel(
  {valueRef, disabled}: {
    valueRef: RefObject<string> | StaticRef<string>,
    disabled: boolean
  }
) {

  return (
    <div className='w-full'>
      <Field className='flex-row justify-center'>
        <Input
          className='block rounded-lg px-3 py-1.5 mt-1 bg-white/5 text-white text-center max-w-full'
          defaultValue={valueRef.current} onChange={e => valueRef.current = e.target.value}
          disabled={disabled}
          />
      </Field>
    </div>
  )
}