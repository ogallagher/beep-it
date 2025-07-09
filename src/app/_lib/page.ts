import { websiteBasePath, ApiRoute } from '@api/const';
import assert from 'assert';
import { RefObject } from 'react';
import Game from './game/game';
import { GameEventKey, JoinEvent } from './game/gameEvent';


/**
 * Join the given game and open a corresponding game event stream.
 *
 * @param force Whether to send the join event even if already joined.
 * @returns New game event stream if created.
 */
export async function joinGame(
  game: Game,
  includeGameConfig: boolean,
  clientDeviceId: string,
  force: boolean,
  gameEventSource?: RefObject<EventSource | undefined> | undefined,
  onGameEvent?: ((e: MessageEvent, onJoin: () => void) => void) | undefined,
  closeGameEventSource?: (() => void) | undefined
) {
  const requestParams = includeGameConfig ? game.save() : new URLSearchParams()
  // set game id
  Game.saveGameId(game.id, requestParams)
  // set client device
  requestParams.set(GameEventKey.DeviceId, clientDeviceId)

  // game game id to url 
  window.history.replaceState(null, '', `?${requestParams}`)

  // details not in window location
  const clientDeviceAlias = game.getDeviceAlias(clientDeviceId)
  if (clientDeviceAlias) {
    requestParams.set('deviceAlias', clientDeviceAlias)
  }

  return await new Promise((res: (eventStream?: EventSource | undefined) => void) => {
    if (gameEventSource?.current === undefined && onGameEvent !== undefined) {
      // subscribe to game events
      gameEventSource!.current = new EventSource(
        `${websiteBasePath}/${ApiRoute.JoinGame}?${requestParams}`
      )

      gameEventSource!.current.onmessage = (rawEvent) => {
        onGameEvent!(rawEvent, res)
      }

      gameEventSource!.current.onerror = (rawEvent) => {
        console.log(`game event error = ${rawEvent}; close connection`)
        closeGameEventSource!()
      }
    }
    else if (force) {
      // send single event
      requestParams.set(GameEventKey.GameId, game.id)
      requestParams.set('skipCreateEventStream', 'true')

      fetch(`${websiteBasePath}/${ApiRoute.JoinGame}?${requestParams}`)
        .then(async (res: Response) => {
          try {
            const resEvent = await res.json() as JoinEvent
            assert.ok(
              resEvent.deviceId === clientDeviceId,
              'GET join did not receive valid confirmation'
            )
          }
          catch (err) {
            console.log(`ERROR ${err}`)
          }
        })
        .finally(res)
    }
    else {
      // already joined
      res()
    }
  })
}
