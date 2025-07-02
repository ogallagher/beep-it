export const boardId = 'gameBoard'

/**
 * Min delay between consecutive actions, to prevent duplicates on mistaken input.
 */
export const widgetActionMinDelay = 500

export enum WidgetType {
  Button = 'button',
  Lever = 'lever',
  Twist = 'twist',
  Key = 'key',
  Path = 'path',
  KeyPad = 'keypad'
}

export const widgetTypes = [
  WidgetType.Button,
  WidgetType.Lever,
  WidgetType.Twist,
  WidgetType.Key,
  WidgetType.Path,
  WidgetType.KeyPad
]

export enum CardinalDirection {
  Up = 'U',
  Right = 'R',
  Down = 'D',
  Left = 'L'
}

/**
 * @param type 
 * @returns Ranked list of default commands.
 */
export function defaultWidgetCommands(type: WidgetType) {
  switch (type) {
    case WidgetType.Button:
      return ['bop', 'press', 'tap']

    case WidgetType.Lever:
      return ['pull', 'push']

    case WidgetType.Twist:
      return ['twist', 'spin']

    case WidgetType.Key:
      return ['type', 'key']

    case WidgetType.Path:
      return ['trace', 'draw']
    
    case WidgetType.KeyPad:
      return ['write', 'spell', 'code']

    default:
      throw new Error(`cannot get default command for invalid widget type ${type}`)
  }
}

export function defaultWidgetLabel(type: WidgetType) {
  switch (type) {
    case WidgetType.Button:
      return 'button'

    case WidgetType.Lever:
      return 'lever'

    case WidgetType.Twist:
      return 'knob'

    case WidgetType.Key:
      return 'key'

    case WidgetType.Path:
      return 'path'
    
    case WidgetType.KeyPad:
      return 'keypad'

    default:
      throw new Error(`cannot get default command for invalid widget type ${type}`)
  }
}

export function defaultWidgetValueText(type: WidgetType) {
  switch (type) {
    case WidgetType.Lever:
      return CardinalDirection.Down

    case WidgetType.Key:
      return 'A'

    case WidgetType.KeyPad:
      return 'please'

    default:
      return undefined
  }
}

export interface WidgetExport {
  id: string
  type: WidgetType
  label: string
  command: string
  commandAudio: string | undefined
  color: string
  valueText: string | undefined
  width: number
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
