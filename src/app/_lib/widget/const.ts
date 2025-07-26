import { Locale } from "@lib/strings"

export const boardId = 'gameBoard'

/**
 * Min delay between consecutive actions, to prevent duplicates on mistaken input.
 */
export const widgetActionMinDelay = 500
export const widgetWaitProgressSteps = 8

export type WidgetId = string

export enum WidgetType {
  Button = 'button',
  Lever = 'lever',
  Twist = 'twist',
  Key = 'key',
  Path = 'path',
  KeyPad = 'keypad',
  Wait = 'wait'
}

/**
 * Enabled/usable widget types.
 */
export const widgetTypes = [
  WidgetType.Button,
  WidgetType.Lever,
  WidgetType.Twist,
  WidgetType.Key,
  WidgetType.Wait,
  WidgetType.Path,
  WidgetType.KeyPad
]

/**
 * Subset of widget types that should work consistently on any client device.
 */
export const crossPlatformWidgetTypes = [
  WidgetType.Button,
  WidgetType.Lever,
  WidgetType.Twist,
  WidgetType.Key,
  WidgetType.Wait,
  WidgetType.KeyPad
]

export enum CardinalDirection {
  Up = 'U',
  Right = 'R',
  Down = 'D',
  Left = 'L'
}

export const cardinalDirections = [
  CardinalDirection.Up,
  CardinalDirection.Right,
  CardinalDirection.Down,
  CardinalDirection.Left
]

export enum TraceDirection {
  Forward = 1,
  Backward = -1,
  Unknown = 0
}

/**
 * @param type 
 * @returns Ranked list of default commands.
 */
export function defaultWidgetCommands(type: WidgetType, locale?: Locale) {
  switch (type) {
    case WidgetType.Button:
      switch (locale) {
        case Locale.Spanish:
          return ['pulsa', 'omprime', 'pega', 'dale a', 'toca']
        case Locale.Korean:
          return ['누르기', '때리기', '치기']
        case Locale.English:
        default:
          return ['bop', 'press', 'tap']
      }

    case WidgetType.Lever:
      switch (locale) {
        case Locale.Spanish:
          return ['jala', 'empuja', 'tira']
        case Locale.Korean:
          return ['밀기', '당그기']
        case Locale.English:
        default:
          return ['pull', 'push']
      }

    case WidgetType.Twist:
      switch (locale) {
        case Locale.Spanish:
          return ['gira', 'rota', 'retuerce']
        case Locale.Korean:
          return ['돌리기', '비틀기', '회전']
        case Locale.English:
        default:
          return ['twist', 'spin']   
      }

    case WidgetType.Key:
      switch (locale) {
        case Locale.Spanish:
          return ['teclea', 'toca', 'ingresa']
        case Locale.Korean:
          return ['치기']
        case Locale.English:
        default:
          return ['type', 'key']
      }

    case WidgetType.Path:
      switch (locale) {
        case Locale.Spanish:
          return []
        case Locale.Korean:
          return ['따르기', '긋기', '그리기']
        case Locale.English:
        default:
          return ['trace', 'draw']
      }
    
    case WidgetType.KeyPad:
      switch (locale) {
        case Locale.Spanish:
          return ['escribe', 'deletrea', 'ingresa']
        case Locale.Korean:
          return ['쓰기', '입력']
        case Locale.English:
        default:
          return ['write', 'spell', 'code']
      }

    case WidgetType.Wait:
      switch (locale) {
        case Locale.Spanish:
          return ['espera', 'pausa', 'deja']
        case Locale.Korean:
          return ['기다리기', '대기중', '그대로 두기']
        case Locale.English:
        default:
          return ['wait', 'freeze', 'leave']
      }

    default:
      throw new Error(`cannot get default command for invalid widget type ${type}`)
  }
}

export function defaultWidgetLabel(type: WidgetType, locale?: Locale) {
  switch (type) {
    case WidgetType.Button:
      switch (locale) {
        case Locale.Spanish:
          return 'botón'
        case Locale.Korean:
          return '단추'
        case Locale.English:
        default:
          return 'button'
      }

    case WidgetType.Lever:
      switch (locale) {
        case Locale.Spanish:
          return 'palanca'
        case Locale.Korean:
          return '지렛대'
        case Locale.English:
        default:
          return 'lever'
      }

    case WidgetType.Twist:
      switch (locale) {
        case Locale.Spanish:
          return 'perilla'
        case Locale.Korean:
          return '손잡이'
        case Locale.English:
        default:
          return 'knob'
      }

    case WidgetType.Key:
      switch (locale) {
        case Locale.Spanish:
          return 'tecla'
        case Locale.Korean:
          return '키'
        case Locale.English:
        default:
          return 'key'
      }

    case WidgetType.Path:
      switch (locale) {
        case Locale.Spanish:
          return 'trayecto'
        case Locale.Korean:
          return '동선'
        case Locale.English:
        default:
          return 'path'
      }
    
    case WidgetType.KeyPad:
      switch (locale) {
        case Locale.Spanish:
          return 'teclado'
        case Locale.Korean:
          return '자판'
        case Locale.English:
        default:
          return 'keypad'
      }

    case WidgetType.Wait:
      switch (locale) {
        case Locale.Spanish:
          return 'demora'
        case Locale.Korean:
          return '정지'
        case Locale.English:
        default:
          return 'lag'
      }

    default:
      throw new Error(`cannot get default label for invalid widget type ${type}`)
  }
}

export function defaultWidgetValueText(type: WidgetType) {
  switch (type) {
    case WidgetType.Lever:
      return CardinalDirection.Down

    case WidgetType.Key:
      return 'A'

    case WidgetType.KeyPad:
      return 'hello'

    case WidgetType.Path:
      return 'M 15 10 L 35 80 L 55 10 L 75 80'

    default:
      return undefined
  }
}

export function defaultWidgetDuration(type: WidgetType, valueTextLength?: number) {
  switch (type) {
    case WidgetType.Twist:
      return 300

    case WidgetType.KeyPad:
      return 250 * (valueTextLength !== undefined ? valueTextLength : 6)

    case WidgetType.Path:
      return 1000

    default:
      return 0
  }
}

export interface WidgetConfig {
  command: string
  commandAudio?: string
  color: string
  valueText?: string
  width: number
  duration: number
}

export interface WidgetExport extends WidgetConfig {
  id: WidgetId
  type: WidgetType
  /**
   * Label was originally not included in parent type because of its special handling in the client UI 
   * (ex. not editable in widgets drawer, displayed separately from other config properties). 
   * However, I think a refactor could reasonably move it to {@linkcode WidgetConfig}.
   */
  label: string
  showLabel: boolean
}

// converted from graphics lib pts.UIPointerActions
export enum UIPointerAction {
  up = 'up',
  down = 'down',
  move = 'move',
  drag = 'drag',
  uidrag = 'uidrag',
  drop = 'drop',
  uidrop = 'uidrop',
  over = 'over',
  out = 'out',
  enter = 'enter',
  leave = 'leave',
  click = 'click',
  keydown = 'keydown',
  keyup = 'keyup',
  pointerdown = 'pointerdown',
  pointerup = 'pointerup',
  contextmenu = 'contextmenu',
  all = 'all'
}

export enum KeyboardAction {
  up = 'up',
  down = 'down'
}

export enum Char {
  a = 'a'.codePointAt(0)!,
  z = 'z'.codePointAt(0)!,
  zero = '0'.codePointAt(0)!,
  nine = '9'.codePointAt(0)!
}
const lettersStart = Char.a
const lettersLen = (Char.z - Char.a) + 1
const digitsStart = Char.zero
const digitsLen = (Char.nine - Char.zero) + 1

export function idxToChar(idx: number) {
  if (idx < digitsLen) {
    return String.fromCodePoint(digitsStart + idx)
  }
  else if (idx < digitsLen + lettersLen) {
    return String.fromCodePoint(lettersStart + (idx - digitsLen))
  }
  else {
    throw new Error(`unsupported random char code index ${idx}`)
  }
}

export function randomChar(seed: number = Math.random()) {
  const allLen = digitsLen + lettersLen
  const idx = Math.round(seed * (allLen-1))
  return idxToChar(idx)
}
