import { Field, Input, Label } from '@headlessui/react'
import { Config } from './config'
import { RefObject, useEffect, useRef, useState } from 'react'
import StaticRef from '@lib/staticRef'
import { Mic, StopCircle, Trash3 } from 'react-bootstrap-icons'
import { audioToFile, generateAudioFileName, generateAudioFilePath, readAudio, trimAudio } from '@lib/widget/audio'
import Game from '@lib/game/game'
import { ApiRoute, gameServerPort, websiteBasePath } from '@api/const'
import { GameAssetEvent, GameEventType } from '@lib/game/gameEvent'
import assert from 'assert'

let canAudioRecord: boolean|undefined

async function recordAudio(
  audioRecorder: RefObject<MediaRecorder|null>, 
  onAudio: (v: string|undefined) => void,
  game: RefObject<Game> | StaticRef<Game>
) {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })
    const audioTrack = audioStream.getTracks()[0]
    await audioTrack.applyConstraints({
      // force mono
      channelCount: 1
    })
    const audioSettings = audioTrack.getSettings()

    audioRecorder.current?.stop()
    audioRecorder.current = new MediaRecorder(audioStream)
    
    const audioData = await (
      readAudio(audioRecorder.current)
      .then((rawAudioData) => {
        return trimAudio(rawAudioData, audioSettings.sampleRate!, 0, 0.1)
      })
    )

    // convert to file for transfer to server
    const audioFileName = generateAudioFileName()

    // send audio file to server
    const queryParams = new URLSearchParams()
    Game.saveGameId(game.current.id, queryParams)

    const reqBody = new FormData()
    reqBody.append('files', audioToFile(audioData, audioFileName))
    fetch(
      `http://${window.location.hostname}:${gameServerPort}${websiteBasePath}/${ApiRoute.GameAsset}?${queryParams.toString()}`,
      {
        method: 'POST',
        body: reqBody
      }
    )
    .then(async (res) => {
      const resEvent = await res.json() as GameAssetEvent

      try {
        assert.ok(
          resEvent.gameEventType === GameEventType.GameAsset, 
          `invalid game asset response ${JSON.stringify(resEvent)}`
        )
        onAudio(generateAudioFilePath(game.current.id, audioFileName))
      }
      catch (err) {
        console.log(`ERROR ${err}`)
      }
    })
  }
  catch (err) {
    console.log(`ERROR failed to load audio stream. ${err}`)
  }
}

export default function WidgetCommand(
  { game, config, setConfig, audioEnabled }: {
    game: RefObject<Game> | StaticRef<Game>
    config: RefObject<Config> | StaticRef<Config>
    setConfig: RefObject<() => void> | StaticRef<() => void>
    audioEnabled: boolean
  }
) {
  /**
   * Widget command audio as a game asset file url.
   */
  const [commandAudioUrl, setCommandAudioUrl] = useState(undefined as string|undefined)
  const [isAudioRecording, setIsAudioRecording] = useState(false)
  const audioRecorder = useRef(null as MediaRecorder|null)

  useEffect(
    () => {
      if (canAudioRecord === undefined) {
        // check device recording capability
        canAudioRecord = (navigator.mediaDevices?.getUserMedia !== undefined)
        if (!canAudioRecord) {
          console.log('ERROR cannot record audio')
        }
      }

      // TODO game config listener for widget command audio
    }
  )

  // TODO update game model on setCommandAudio and send game config event.
  // Create unique audio file id for clients to load remote audio files on demand

  return (
    <Field 
      className='w-full flex flex-row flex-wrap justify-start gap-x-2 gap-y-1' >
      <Label className='flex flex-col justify-center'>
        <div>command</div>
      </Label>
      <Input
        className='block rounded-lg px-3 py-1.5 bg-white/5 text-white'
        title='The verb/action done to this widget.'
        onChange={e => config.current.command = e.target.value}
        defaultValue={config.current.command}
        onBlur={setConfig.current}
        />
      {/* command audio input */}
      <div className={audioEnabled ? '' : 'hidden'}>
        <button
          className='cursor-pointer hover:scale-105 p-1 text-2xl'
          disabled={canAudioRecord ? undefined : true}
          title='Record custom command audio'
          type='button' onClick={
            () => {
              setIsAudioRecording(!isAudioRecording)

              if (isAudioRecording) {
                // stop recording
                audioRecorder.current!.stop()
              }
              else {
                // start recording
                recordAudio(audioRecorder, setCommandAudioUrl, game)
              }
            }
          } >
          {isAudioRecording ? <StopCircle /> : <Mic />}
        </button>
        <button
          className={
            'cursor-pointer hover:scale-105 p-1 text-2xl '
            + (commandAudioUrl === undefined ? 'hidden' : '')
          }
          title='Delete command audio'
          type='button' onClick={
            () => {
              setCommandAudioUrl(undefined)
            }
          } >
          <Trash3 />
        </button>
        <audio 
          className={
            'h-7 ' 
            + (commandAudioUrl === undefined ? 'hidden' : '')
          }
          controls={true}
          controlsList='nofullscreen'
          muted={undefined}
          preload='auto'
          src={commandAudioUrl} />
        {/* TODO control to delete audio */}
      </div>
    </Field>
  )
} 