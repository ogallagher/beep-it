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