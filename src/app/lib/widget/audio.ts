import { websiteBasePath } from '@api/const'
import { ulid } from 'ulid'

export enum GameAssetPathPart {
  '0_Root' = 'gameAsset',
  '1_Temp' = 'temp',
  '1_GameId' = 'gameId'
}

/**
 * Length of each sample in recorded audio. 
 */
export const audioSampleMs = 200

export function generateAudioFileName(fileExt: string) {
  return `${ulid()}.${fileExt}`
}

export function generateAudioFilePath(gameId: string, fileName: string) {
  return `${websiteBasePath}/${GameAssetPathPart['0_Root']}/${GameAssetPathPart['1_GameId']}/${gameId}/${fileName}`
}

export function audioFilePathToGameId(filePath: string) {
  return filePath.match(new RegExp(`/${GameAssetPathPart['1_GameId']}/([^/]+)/`))![1]
}