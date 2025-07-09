export const boardId = 'gameBoard'

/**
 * Min delay between consecutive actions, to prevent duplicates on mistaken input.
 */
export const widgetActionMinDelay = 500
export const widgetWaitProgressSteps = 8

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
  WidgetType.Wait
]

/**
 * Subset of widget types that should work consistently on any client device.
 */
export const crossPlatformWidgetTypes = [
  WidgetType.Button,
  WidgetType.Lever,
  WidgetType.Twist,
  WidgetType.Wait
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

    case WidgetType.Wait:
      return ['wait', 'freeze', 'leave']

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

    case WidgetType.Wait:
      return 'lag'

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
      return 'please'

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
  id: string
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

