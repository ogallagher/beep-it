import { websiteBasePath } from '@api/const'

declare global {
  namespace lamejs {
    class Mp3Encoder {
      constructor(channels: number, sampleRate: number, kbps: number)

      /**
       * @param left Left channel audio data, or only channel if mono.
       * @param right Right channel audio data if stereo.
       * @returns Corresponding PCM encoded bytes for an MP3 container, excluding a potential remainder to be fetched with `flush`.
       */
      encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array<ArrayBuffer>
      
      /**
       * Fetch remaining encoded bytes after calls to `encodeBuffer`.
       */
      flush(): Int8Array<ArrayBuffer>
    }

    class WavHeader {
      static readHeader(headerData: DataView): {
        dataOffset: number
        dataLen: number
      }
    }
  }
}

export const audioToMp3ProcessorName = 'audioToMp3'
// TODO integrate audio worklet processor with nextjs
export const audioToMp3ProcessorPath = `${websiteBasePath}/scripts/${audioToMp3ProcessorName}.js`
const audioWorkletProcessorChunkLength = 128

export interface AudioProcessor {
  processPart(audioPart: Blob): Promise<BlobPart>

  flush(): BlobPart
}

export class AudioToMp3 implements AudioProcessor, AudioWorkletProcessorImpl {
  declare port: MessagePort
  readonly trackIndex = 0
  readonly channelIdx = 0
  private mp3enc: lamejs.Mp3Encoder

  constructor(sampleRate: number) {
    this.mp3enc = new lamejs.Mp3Encoder(1, sampleRate, 128)
  }

  async processPart(audioPart: Blob): Promise<BlobPart> {
    const bytes = await audioPart.arrayBuffer()
    const samples = new Int16Array(
      // 2-byte array must be even length, so easiest is to drop extra byte at each part
      bytes.transfer(bytes.byteLength - (bytes.byteLength % 2))
    )
    return new Blob([this.mp3enc.encodeBuffer(samples)])
  }

  flush() {
    return new Blob([this.mp3enc.flush()])
  }

  /**
   * // TODO if I end up deploying this as a worklet processor, finish adapting or migrating processPart to process.
   * @param inputs 
   * @param outputs 
   * @param _parameters 
   * @returns 
   */
  process(inputs: Float32Array<ArrayBufferLike>[][], outputs: Float32Array<ArrayBufferLike>[][], _parameters: Record<string, Float32Array<ArrayBufferLike>>) {
    const inputMono = inputs[this.trackIndex][this.channelIdx]
    const outputMono = outputs[this.trackIndex][this.channelIdx]
    
    return false
  }
}

// registerProcessor(audioToMp3ProcessorName, AudioToMp3)