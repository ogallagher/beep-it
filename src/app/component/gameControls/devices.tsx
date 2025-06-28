import Game from '@lib/game/game'
import { GameStateListenerKey } from '@lib/game/const'
import StaticRef from '@lib/staticRef'
import { RefObject, useEffect, useState } from 'react'
import { HddRack, PersonDash } from 'react-bootstrap-icons'
import { Field, Input, Label } from '@headlessui/react'
import { clientSendLeaveEvent, GameEventType } from '@lib/game/gameEvent'
import { joinGame } from 'app/page'

const deviceIdSummaryLength = 4

function GameDevice(
  { deviceId, isClientDevice, deviceAlias, game } : {
    deviceId: string
    isClientDevice: boolean
    deviceAlias?: string
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  return (
    <Field 
      title={'Manage device ' + deviceId + (isClientDevice ? ' (self)' : '')}
      className={
        'flex flex-row gap-1 pt-2 ' + (isClientDevice ? 'font-bold' : '')
      } >
      <Label className='flex flex-col justify-center font-mono'>
        <div>...{deviceId.substring(deviceId.length - deviceIdSummaryLength)}</div>
      </Label>

      <Input
        className='rounded-lg bg-white/5 text-white px-3 py-0.5'
        type='text' placeholder='device alias'
        defaultValue={deviceAlias}
        onChange={e => {
          deviceAlias = e.target.value
        }}
        onBlur={() => {
          // update device alias in local game model
          game.current.addDevice(deviceId, deviceAlias)

          // send join with new alias
          joinGame(game.current, deviceId, true)
        }} >
      </Input>

      <button
        className='cursor-pointer hover:scale-105'
        title='Remove device from game.'
        type='button' onClick={() => {
          // on device remove, send leave
          clientSendLeaveEvent({
            gameEventType: GameEventType.Leave,
            gameId: game.current.id,
            deviceId,
            deviceCount: game.current.getDeviceCount()
          })

          // if self, remove from local game model
          if (isClientDevice) {
            game.current.deleteDevice(deviceId)
          }
          // else, wait to receive from server
        }}>
        <PersonDash />
      </button>
    </Field>
  )
}

export default function GameDevices(
  { game, clientDeviceId }: {
    game: StaticRef<Game> | RefObject<Game>
    clientDeviceId: StaticRef<string> | RefObject<string>
  }
) {
  const [deviceCount, setDeviceCount] = useState(game.current.getDeviceCount())
  const [devicesOpen, setDevicesOpen] = useState(false)
  const [devices, setDevices] = useState(game.current.getDevices())

  useEffect(
    () => {
      // render device count updates
      game.current.addStateListener(GameStateListenerKey.DevicesCount, (deviceCount) => {
        setDeviceCount(deviceCount)
        setDevices(game.current.getDevices())
      })
    },
    []
  )

  /**
   * // TODO Submit device changes to game model and server.
   */
  function change() {
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row gap-2">
        <div>device count:</div>
        <div className="font-bold">
          {deviceCount}
        </div>
        <button
          className='cursor-pointer hover:scale-105'
          title='Manage devices.'
          type='button' onClick={() => setDevicesOpen(!devicesOpen)}>
          <HddRack />
        </button>
      </div>

      {(devicesOpen ? [...devices] : []).map((deviceId) => {
        return (
          <GameDevice key={deviceId}
            game={game}
            deviceId={deviceId} 
            deviceAlias={game.current.getDeviceAlias(deviceId)} 
            isClientDevice={deviceId === clientDeviceId.current} />
        )
      })}
    </div>
  )
}