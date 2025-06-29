import { websiteBasePath } from '@api/const'
import { ulid } from 'ulid'

export enum GameAssetPathPart {
  '0_Root' = 'gameAsset',
  '1_Temp' = 'temp',
  '1_GameId' = 'gameId'
}
/**
 * Delay between creation of a game asset file and deletion. 7 days in ms.
 */
export const gameAssetDeleteDelay = 1000 * 60 * 60 * 24 * 7

/**
 * Length of each part/chunk in recorded audio, in milliseconds.
 */
export const audioPartLength = 200
export const rawAudioBlobType = 'audio/ogg; codecs=opus'
export const rawAudioFileExt = 'ogg'

export function generateAudioFileName() {
  return `${ulid()}.${rawAudioFileExt}`
}

export function generateAudioFilePath(gameId: string, fileName: string) {
  return `${websiteBasePath}/${GameAssetPathPart['0_Root']}/${GameAssetPathPart['1_GameId']}/${gameId}/${fileName}`
}

export function audioFilePathToGameId(filePath: string) {
  return filePath.match(new RegExp(`/${GameAssetPathPart['1_GameId']}/([^/]+)/`))![1]
}

export async function readAudio(recorder: MediaRecorder) {
  // read output stream to file data
  const audioParts: BlobPart[] = []
  recorder.ondataavailable = (e) => {
    audioParts.push(e.data)
  }

  return new Promise((res: (audioData: BlobPart[]) => void) => {
    recorder.onstop = () => {
      res(audioParts)
    }

    recorder.start(audioPartLength)
  })
}

export function audioToBlob(audioParts: BlobPart[]) {
  return new Blob(audioParts, {
    type: rawAudioBlobType
  })
}

export function audioToFile(audioParts: BlobPart[], fileName: string) {
  return new File(audioParts, fileName, {
    type: rawAudioBlobType
  })
}

/**
 * @param audioData 
 * @param sampleRate
 * @param start Amount to remove from start, in seconds.
 * @param end Amount to remove from end, in seconds.
 */
export async function trimAudio(
  audioData: BlobPart[], 
  sampleRate: number,
  start: number, end: number
) {
  const ctx = new AudioContext({
    sampleRate: sampleRate
  })

  const audioBufferIn = await ctx.decodeAudioData(await audioToBlob(audioData).arrayBuffer())
  const duration = audioBufferIn.duration - (start + end)

  // pass modified audio buffer to output stream
  const audioSourceOut = new AudioBufferSourceNode(ctx, {
    buffer: audioBufferIn
  })
  const audioOut = new MediaStreamAudioDestinationNode(ctx, {
    channelCount: 1
  })
  audioSourceOut.connect(audioOut)

  // read output stream
  const audioRecorder = new MediaRecorder(audioOut.stream)
  audioSourceOut.onended = () => audioRecorder.stop()
  audioSourceOut.start(0, start, duration)

  return readAudio(audioRecorder)
}