import { defaultLocale } from '@lib/strings'
import { WidgetId } from '@lib/widget/const'
import { createContext } from 'react'

export const HasDeviceFeaturesCtx = createContext(false)

export class ActionValueTextPayload {
  public activeWidgetId: WidgetId|undefined = undefined
  public valueText: Map<WidgetId, string> = new Map()
  public actionText: Map<WidgetId, string> = new Map()
  public showActionChar = (c: string|undefined, w?: WidgetId) => {}
  public onAction: Map<WidgetId, () => void> = new Map()
}
/**
 * Context of the active widget's value text, and handlers for input progress and submitting the widget action.
 * Used for keypad widgets.
 */
export const ActionValueTextCtx = createContext(new ActionValueTextPayload())

export const LocaleCtx = createContext(defaultLocale)