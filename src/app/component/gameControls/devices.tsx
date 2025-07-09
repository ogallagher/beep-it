import Game from 'app/_lib/game/game'
import { GameStateListenerKey } from 'app/_lib/game/const'
import StaticRef from 'app/_lib/staticRef'
import { RefObject, useEffect, useState } from 'react'
import { HddRack, PersonDash } from 'react-bootstrap-icons'
import { Field, Input, Label } from '@headlessui/react'
import { clientSendLeaveEvent, GameEventType } from 'app/_lib/game/gameEvent'
import { joinGame } from 'app/_lib/page'

const deviceIdSummaryLength = 4

function GameDevice(
  { deviceId, isClientDevice, game } : {
    deviceId: string
    isClientDevice: boolean
    game: StaticRef<Game> | RefObject<Game>
  }
) {
  function getDeviceAlias() {
    return game.current.getDeviceAlias(deviceId) || ''
  }
  const [deviceAlias, setDeviceAlias] = useState(getDeviceAlias)

  useEffect(
    () => {
      // render device updates
      game.current.addStateListener(GameStateListenerKey.DevicesCount, deviceId, () => setDeviceAlias(getDeviceAlias()))
    },
    [ game ]
  )

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
        className='rounded-lg bg-white/5 text-white not-dark:bg-black/5 not-dark:text-black px-3 py-0.5'
        type='text' placeholder='device alias'
        value={deviceAlias}
        onChange={e => {
          setDeviceAlias(e.target.value)
        }}
        onBlur={() => {
          // update device alias in local game model
          game.current.addDevice(deviceId, deviceAlias)

          // send join with new alias
          joinGame(game.current, false, deviceId, true)
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
            game.current.setJoined(false)
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
      // render device collection updates
      game.current.addStateListener(GameStateListenerKey.DevicesCount, GameDevices.name, (deviceCount) => {
        setDeviceCount(deviceCount)
        setDevices(game.current.getDevices())
      })
    },
    []
  )

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
            isClientDevice={deviceId === clientDeviceId.current} />
        )
      })}
    </div>
  )
}