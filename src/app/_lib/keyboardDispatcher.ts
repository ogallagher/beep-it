import { RefObject } from 'react'
import Game from './game/game'
import { keyboardEventToKeyboardAction } from './widget/graphics'
import { KeyboardAction } from './widget/const'
import { GameStateListenerKey } from './game/const'

export type KeyboardListener = (event: KeyboardEvent) => void

/**
 * To handle the case that multiple key/keypad widget controls can listen for the same keyboard event
 * character, the intermediate keyboard event dispatcher will dispatch to only one of them, by assuming
 * the key event was meant for the correct (corresponds to game command) widget.
 */
class KeyboardDispatcher {
  /**
   * Map key char to widget id to listener. If a single widget control listens for multiple
   * key chars, all key chars for that widget map to the same handler.
   */
  protected keyListeners: Map<string, Map<string, KeyboardListener>> = new Map()
  /**
   * Map widget id to listener abort controller.
   */
  protected widgetKeys: Map<string, Set<string>> = new Map()
  protected abortController: AbortController|undefined
  protected game: RefObject<Game>

  constructor(game: RefObject<Game>) {
    this.game = game

    game.current.addStateListener(GameStateListenerKey.Started, KeyboardDispatcher.name, (started) => {
      if (started) {
        this.enable()
      }
    })
    game.current.addStateListener(GameStateListenerKey.Ended, KeyboardDispatcher.name, (ended) => {
      if (ended) {
        this.disable()
      }
    })
  }

  public addListener(keyChars: Iterable<string>, widgetId: string, listener: KeyboardListener) {
    // widget keys
    this.widgetKeys.set(widgetId, new Set(keyChars))

    for (let keyChar of keyChars) {
      if (!this.keyListeners.has(keyChar)) {
        this.keyListeners.set(keyChar, new Map())
      }
      // key listener
      this.keyListeners.get(keyChar)!.set(widgetId, listener)
    }
  }

  public removeListener(widgetId: string) {
    if (this.widgetKeys.has(widgetId)) {
      // remove from key listeners
      for (let keyChar of this.widgetKeys.get(widgetId)!.keys()) {
        this.keyListeners.get(keyChar)?.delete(widgetId)
      }

      // remove from abort controllers
      this.widgetKeys.delete(widgetId)
    }
  }

  protected onKeyboardEvent(event: KeyboardEvent) {
    const commandWidgetId = this.game.current.getCommandWidgetId()
    const keyChar = event.key
    const listeners = this.keyListeners.get(keyChar)

    if (listeners && listeners.size > 0) {
      if (keyboardEventToKeyboardAction(event) === KeyboardAction.up) {
        // send key up to all listeners for this char
        listeners.forEach(l => l(event))
      }
      else {
        let listener: KeyboardListener

        if (commandWidgetId && listeners.has(commandWidgetId)) {
          // dispatch to active command widget
          listener = listeners.get(commandWidgetId)!
        }
        else {
          // dispatch to any arbitrary active widget
          listener = listeners.values().next().value!
        }

        listener(event)
      }
    }
    // else, no listeners for this key
  }

  protected enable() {
    this.abortController = new AbortController()

    // enable shared keyboard listeners in DOM
    for (let keyEventType of ['keydown', 'keyup']) {
      document.body.addEventListener(
        keyEventType as ('keydown'|'keyup'), 
        e => this.onKeyboardEvent(e), 
        {signal: this.abortController.signal}
      )
    }
  }

  protected disable() {
    this.abortController?.abort()
  }
}

let keyboardDispatcher: KeyboardDispatcher
export function initKeyboardDispatcher(game: RefObject<Game>) {
  keyboardDispatcher = new KeyboardDispatcher(game)
}

export function addKeyboardListener(keyChars: Iterable<string>, widgetId: string, listener: KeyboardListener) {
  keyboardDispatcher?.addListener(keyChars, widgetId, listener)
}

export function removeKeyboardListener(widgetId: string) {
  keyboardDispatcher?.removeListener(widgetId)
}
