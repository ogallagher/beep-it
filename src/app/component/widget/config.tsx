'use client'

import { RefObject } from 'react'
import { WidgetType } from '../../lib/widget/const'
import { Field, Input, Label } from '@headlessui/react'
import StaticRef from '@lib/staticRef'

interface Config {
  command: string
}

export default function WidgetConfig(
  {type, configRef}: {
    type: WidgetType,
    configRef: RefObject<Config> | StaticRef<Config>
  }
) {
  return (
    <div>
      <div>color</div>
      <div>duration</div>
      <div className='w-full'>
        <Field title='The verb done to this widget.'>
          <Label>command</Label>
          <Input
            className='block rounded-lg px-3 py-1.5 mt-1 bg-white/5 text-white w-full'
            onChange={e => configRef.current.command = e.target.value}
            defaultValue={configRef.current.command}
            />
        </Field>
      </div>
    </div>
  )
}