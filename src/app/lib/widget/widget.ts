import { ulid } from 'ulid'
import { defaultWidgetCommands, defaultWidgetValueText, WidgetExport, WidgetType } from './const'

export default class Widget {
  id: string
  type: WidgetType
  label: string
  command: string
  color: string
  valueText: string | undefined

  constructor(w: WidgetExport) {
    this.id = w.id
    this.type = w.type
    this.label = w.label
    this.command = w.command
    this.color = w.color
    this.valueText = w.valueText
  }

  save(): WidgetExport {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      command: this.command,
      color: this.color,
      valueText: this.valueText
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
      command: defaultWidgetCommands(type)[0],
      color: '#ffffff',
      valueText: defaultWidgetValueText(type)
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
    return `${type} ${id.substring(id.length-4)}`
  }
}

export function serializeWidget(widgetExport: WidgetExport) {
  return JSON.stringify(widgetExport)
}

export function deserializeWidget(widgetImport: string) {
  return JSON.parse(widgetImport) as WidgetExport
}

