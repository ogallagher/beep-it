import { websiteBasePath } from '@api/const'
import { ulid } from 'ulid'
declare class AudioProcessor {
  processPart(b: Blob): Promise<BlobPart>
  flush(): BlobPart
}

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
export const audioPartLength = 500
export enum AudioMediaType { 
  /**
   * Media (MIME, container) type for saving the raw audio to blobs or files. Most browsers should read and write
   * of this type natively. However, some (ex. ios mobile) do not.
   */
  Ogg = 'audio/ogg',
  /**
   * MP3 media type that hopefully is compatible with more browsers than {@linkcode AudioMediaType.Ogg}.
   */
  Mp3 = 'audio/mp3'
}

/**
 * Audio encoding. 
 * Opus should be most widely supported according to https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/WebRTC_codecs.
 */
export const rawAudioCodec = 'opus'
export const rawAudioBlobType = `${AudioMediaType.Ogg}; codecs=${rawAudioCodec}`
export const mp3AudioBlobType = AudioMediaType.Mp3

export function audioTypeToFileExt(type: AudioMediaType) {
  return type.split('/')[1]
}

export function generateAudioFileName(mediaType: AudioMediaType) {
  return `${ulid()}.${audioTypeToFileExt(mediaType)}`
}

export function generateAudioFilePath(gameId: string, fileName: string) {
  return `${websiteBasePath}/${GameAssetPathPart['0_Root']}/${GameAssetPathPart['1_GameId']}/${gameId}/${fileName}`
}

export function audioFilePathToGameId(filePath: string) {
  return filePath.match(new RegExp(`/${GameAssetPathPart['1_GameId']}/([^/]+)/`))![1]
}

export async function readAudio(recorder: MediaRecorder, processor?: AudioProcessor) {
  // read output stream to file data
  const audioParts: BlobPart[] = []
  let readPromiseChain: Promise<void|number> = Promise.resolve()
  recorder.ondataavailable = (e) => {
    if (processor) {
      readPromiseChain = readPromiseChain.then(async () => audioParts.push(await processor.processPart(e.data)))
    }
    else {
      audioParts.push(e.data)
    }    
  }

  return new Promise((res: (audioData: BlobPart[]) => void) => {
    recorder.onstop = () => {
      if (processor) {
        readPromiseChain = readPromiseChain.then(() => audioParts.push(processor.flush()))
      }
      
      readPromiseChain.then(() => res(audioParts))
    }

    recorder.start(audioPartLength)
  })
}

export function audioToBlob(audioParts: BlobPart[], type: string) {
  return new Blob(audioParts, {
    type
  })
}

export function audioToFile(audioParts: BlobPart[], type: string, fileName: string) {
  return new File(audioParts, fileName, {
    type
  })
}

/**
 * Trim and encode audio for export.
 * 
 * @param audioData 
 * @param sampleRate
 * @param start Amount to remove from start, in seconds.
 * @param end Amount to remove from end, in seconds.
 * @param mediaType 
 */
export async function trimEncodeAudio(
  audioData: BlobPart[], 
  sampleRate: number,
  start: number, end: number,
  mediaType: AudioMediaType
) {
  const ctx = new AudioContext({
    sampleRate: sampleRate
  })

  const audioBufferIn = await ctx.decodeAudioData(await audioToBlob(audioData, rawAudioBlobType).arrayBuffer())
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
