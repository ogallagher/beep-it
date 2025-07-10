import { ulid } from 'ulid'
import { defaultWidgetCommands, defaultWidgetDuration, defaultWidgetLabel, defaultWidgetValueText, WidgetExport, WidgetType } from './const'

export default class Widget {
  id: string
  type: WidgetType
  label: string
  showLabel: boolean
  command: string
  /**
   * Widget command audio url string.
   */
  commandAudio: string | undefined
  color: string
  /**
   * For {@linkcode WidgetType.Lever}, this is the direction as a character (U,R,D,L).
   * For {@linkcode WidgetType.Key}, this is a single visible character.
   * For {@linkcode WidgetType.KeyPad}, this is a string of visible characters.
   * For {@linkcode WidgetType.Path}, this is a bezier curve in svg syntax.
   */
  valueText: string | undefined
  width: number
  /**
   * Estimated **extra** time needed to complete this widget action, in addition to the game's command delay, in milliseconds.
   */
  duration: number

  constructor(w: WidgetExport) {
    this.id = w.id
    this.type = w.type
    this.label = w.label
    this.showLabel = w.showLabel
    this.command = w.command
    this.commandAudio = w.commandAudio
    this.color = w.color
    this.valueText = w.valueText
    this.width = w.width
    this.duration = w.duration
  }

  save(): WidgetExport {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      showLabel: this.showLabel,
      command: this.command,
      commandAudio: this.commandAudio,
      color: this.color,
      valueText: this.valueText,
      width: this.width,
      duration: this.duration
    }
  }

  static save(w: Widget): string {
    return JSON.stringify(w.save())
  }

  static load(w: string): Widget {
    return new Widget(JSON.parse(w))
  }

  static new(type: WidgetType): Widget {
    const id = Widget.generateId()

    return new Widget({
      id,
      type,
      label: Widget.generateLabel(type, id),
      showLabel: true,
      command: defaultWidgetCommands(type)[0],
      commandAudio: undefined,
      color: '#ffffff',
      valueText: defaultWidgetValueText(type),
      width: 100,
      duration: defaultWidgetDuration(type)
    })
  }

  /**
   * 
   * @param widget 
   * @returns New widget instance with same information and new id.
   */
  static clone(widget: WidgetExport): Widget {
    const clone = new Widget(widget)
    clone.id = Widget.generateId()

    return clone
  }

  private static generateId() {
    return ulid()
  }

  public static generateLabel(type: WidgetType, id: string) {
    return `${defaultWidgetLabel(type)} ${id.substring(id.length-4)}`
  }
}

export function serializeWidget(widgetExport: WidgetExport) {
  return JSON.stringify(widgetExport)
}

export function deserializeWidget(widgetImport: string) {
  return JSON.parse(widgetImport) as WidgetExport
}

