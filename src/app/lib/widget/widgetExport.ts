import { WidgetType } from './const'

export interface WidgetExport {
  type: WidgetType
  label?: string
  command?: string
}

export function serializeWidget(widgetExport: WidgetExport) {
  return JSON.stringify(widgetExport)
}

export function deserializeWidget(widgetImport: string) {
  return JSON.parse(widgetImport) as WidgetExport
}

