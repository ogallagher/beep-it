export type DeviceFeatureListener = (feature: boolean) => void
enum DeviceFeature {
  HasTouch = 'hasTouch',
  HasKeyboard = 'hasKeyboard'
}

export const hasKeyboardDefault = true
export const hasTouchDefault = false

/**
 * Client device features.
 */
class DeviceFeatures {
  /**
   * Whether device has a touch screen.
   */
  protected _hasTouch: boolean
  /**
   * Whether device has a physical keyboard.
   */
  protected _hasKeyboard: boolean

  protected featureListeners: Map<DeviceFeature, Map<string, DeviceFeatureListener>>

  constructor() {
    this._hasTouch = ('ontouchstart' in window)
    // For lack of ability to detect whether input peripherals includes a physical keyboard, 
    // I approximate here.
    this._hasKeyboard = !this._hasTouch

    this.featureListeners = new Map([
      [DeviceFeature.HasTouch, new Map()],
      [DeviceFeature.HasKeyboard, new Map()]
    ])
  }

  get hasTouch() {
    return this._hasTouch
  }

  set hasTouch(hasTouch: boolean) {
    this._hasTouch = hasTouch
    this.featureListeners.get(DeviceFeature.HasTouch)?.forEach(l => l(this._hasTouch))
  }

  get hasKeyboard() {
    return this._hasKeyboard
  }

  set hasKeyboard(hasKeyboard: boolean) {
    this._hasKeyboard = hasKeyboard
    this.featureListeners.get(DeviceFeature.HasKeyboard)?.forEach(l => l(this._hasKeyboard))
  }

  addFeatureListener(feature: DeviceFeature, listenerKey: string, listener: DeviceFeatureListener) {
    this.featureListeners.get(feature)!.set(listenerKey, listener)
  }
}

let deviceFeatures: DeviceFeatures
export function initDeviceFeatures() {
  deviceFeatures = new DeviceFeatures()
}

export function setHasTouch(hasTouch: boolean) {
  deviceFeatures.hasTouch = hasTouch
}

export function getHasTouch() {
  return deviceFeatures.hasTouch
}

export function addHasTouchListener(listenerKey: string, listener: DeviceFeatureListener) {
  deviceFeatures.addFeatureListener(DeviceFeature.HasTouch, listenerKey, listener)
}

export function setHasKeyboard(hasKeyboard: boolean) {
  deviceFeatures.hasKeyboard = hasKeyboard
}

export function getHasKeyboard() {
  return deviceFeatures.hasKeyboard
}

export function addHasKeyboardListener(listenerKey: string, listener: DeviceFeatureListener) {
  deviceFeatures.addFeatureListener(DeviceFeature.HasKeyboard, listenerKey, listener)
}