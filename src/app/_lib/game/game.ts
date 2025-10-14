import { ulid } from 'ulid'
import Widget from '@lib/widget/widget'
import { CommandEvent, ConfigEvent, DoWidgetEvent, EndEvent, GameEndReason, GameEvent, GameEventListener, GameEventType, TurnEvent } from './gameEvent'
import { BoardDisplayMode, GameTurnMode, GameConfigListenerKey, GameStateListenerKey, commandDelayMin, ConfigListener, GameConfig, gameStartDelayMax, GameState, StateListener, gameDeleteDelay, commandDelayDefault, GameId, DeviceId, GameAnyListenerKey, turnCommandCountMax, turnCommandCountMin } from './const'
import { WidgetExport, WidgetId, WidgetType } from '@lib/widget/const'

export default class Game {
  public id: GameId
  /**
   * Attributes of a game that become static on start.
   * 
   * Public in order to bypass configListeners when changes come from local client.
   */
  public config: GameConfig
  /**
   * Attributes of a game that are dynamic.
   */
  protected state: GameState = {
    commandCount: 0,
    commandDelay: commandDelayDefault,
    commandTimeout: null,
    commandWidgetId: '',
    turnPlayerIdx: -1,
    turnCommandCountTotal: 0,
    turnCommandCount: -1,
    lastEventType: GameEventType.Pending,
    preview: false,
    started: false,
    ended: false,
    endReason: GameEndReason.Unknown,
    /**
     * The client device that is hosting the game (first to join).
     */
    deviceId: null,
    joined: false,
    devices: {
      count: 0,
      ids: new Set(),
      aliases: new Map()
    }
  }
  protected startTimeout: NodeJS.Timeout | null = null
  protected deleteTimeout: NodeJS.Timeout | null = null
  /**
   * Methods to call when the given config attr changes.
   * Used to propogate game model changes to UI components.
   */
  protected configListeners: Map<GameConfigListenerKey, Map<string, ConfigListener>> = new Map([
    [GameConfigListenerKey.PlayersCount, new Map()],
    [GameConfigListenerKey.Widgets, new Map()],
    [GameConfigListenerKey.BoardDisplayMode, new Map()],
    [GameConfigListenerKey.GameTurnMode, new Map()]
  ])
  /**
   * Methods to call when the given state attr changes.
   * Very similar to `configListeners`.
   */
  protected stateListeners: Map<GameStateListenerKey, Map<string, StateListener>> = new Map([
    [GameStateListenerKey.DevicesCount, new Map()],
    [GameStateListenerKey.Joined, new Map()],
    [GameStateListenerKey.Preview, new Map()],
    [GameStateListenerKey.Started, new Map()],
    [GameStateListenerKey.Ended, new Map()],
    [GameStateListenerKey.CommandWidgetId, new Map()],
    [GameStateListenerKey.TurnPlayerIdx, new Map()]
  ])
  /**
   * References to config and state listeners by widget, to enable child listener
   * removal when the parent widget is deleted from the game.
   */
  protected listenerWidgets: Map<
    WidgetId, 
    {
      config: Map<GameAnyListenerKey, Set<string>>,
      state: Map<GameAnyListenerKey, Set<string>>
    }
  > = new Map()

  constructor(id?: WidgetId | null, config?: GameConfig) {
    this.id = id || Game.generateId()
    this.config = config || {
      boardDisplayMode: BoardDisplayMode.Default,
      gameTurnMode: GameTurnMode.Default,
      players: {
        count: 1
      },
      difficulty: 0.5,
      widgets: new Map()
    }

    // Listeners for transitively dependent attributes. Ex. if board mode changes, then the placement
    // of widgets across devices must change.

    // board mode, devices --> widgets
    this.addConfigListener(GameConfigListenerKey.BoardDisplayMode, `${Game.name}.config.widgets`, () => {
      this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
    })
    this.addStateListener(GameStateListenerKey.DevicesCount, `${Game.name}.config.widgets`, () => {
      this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
    })
  }

  getDeviceCount() {
    return this.state.devices.count
  }

  setDeviceCount(deviceCount: number) {
    this.state.devices.count = deviceCount
    this.stateListeners.get(GameStateListenerKey.DevicesCount)?.forEach(l => l(deviceCount))
  }

  getDevices() {
    return this.state.devices.ids
  }

  /**
   * Add to devices if not already registered. Internally calls `setDeviceCount`.
   */
  addDevice(deviceId: string, deviceAlias?: string) {
    this.state.devices.ids.add(deviceId)
    if (deviceAlias) {
      this.state.devices.aliases.set(deviceId, deviceAlias)
    }
    this.setDeviceCount(this.state.devices.ids.size)
  }

  /**
   * Remove from devices. Internally calls `setDeviceCount`.
   */
  deleteDevice(deviceId: DeviceId) {
    this.state.devices.ids.delete(deviceId)
    this.setDeviceCount(this.state.devices.ids.size)
  }

  getDeviceAlias(deviceId: DeviceId) {
    return this.state.devices.aliases.get(deviceId)
  }

  /**
   * Replace devices list. Internally calls `setDeviceCount`.
   */
  setDevices(deviceIds: Iterable<DeviceId>, deviceAliases: Iterable<[DeviceId, string|undefined]>) {
    this.state.devices.ids = new Set(deviceIds)
    for (const [id, alias] of deviceAliases) {
      this.state.devices.aliases.set(id, alias)
    }
    this.setDeviceCount(this.state.devices.ids.size)
  }

  getJoined() {
    return this.state.joined
  }

  setJoined(joined: boolean) {
    this.state.joined = joined
    this.stateListeners.get(GameStateListenerKey.Joined)?.forEach(l => l(joined))

    if (this.state.endReason === GameEndReason.StartDelay) {
      this.state.ended = false
      this.setEndReason(GameEndReason.Unknown)
    }
  }

  getPreview() {
    return this.state.preview
  }

  /**
   * Set {@linkcode GameState.preview state.preview} and call corresponding state listeners.
   */
  setPreview(preview: boolean) {
    this.state.preview = preview
    this.stateListeners.get(GameStateListenerKey.Preview)?.forEach(l => l(preview))
  }

  getStarted() {
    return this.state.started
  }

  /**
   * Set `state.started` and call corresponding state listeners.
   * Also sets `state.ended=false` if `started=true`.
   * 
   * @param started New value for `state.started`.
   */
  setStarted(started: boolean) {
    this.state.started = started
    this.stateListeners.get(GameStateListenerKey.Started)?.forEach(l => l(started))

    if (started && this.state.ended) {
      this.state.endReason = GameEndReason.Unknown
      this.setEnded(false)
    }
  }

  getEnded() {
    return this.state.ended
  }

  setEnded(ended: boolean) {
    this.state.ended = ended
    this.stateListeners.get(GameStateListenerKey.Ended)?.forEach(l => l(ended))
  }

  getEndReason() {
    return this.state.endReason
  }

  setEndReason(reason: GameEndReason, invokeListeners: boolean = true) {
    this.state.endReason = reason
    if (invokeListeners) {
      this.stateListeners.get(GameStateListenerKey.Ended)?.forEach(l => l(this.state.ended))
    }
  }

  getPlayerCount() {
    return this.config.players.count
  }

  setPlayerCount(playerCount: number) {
    this.config.players.count = playerCount
    this.configListeners.get(GameConfigListenerKey.PlayersCount)?.forEach(l => l(playerCount))
  }

  setBoardDisplayMode(boardDisplayMode: BoardDisplayMode) {
    this.config.boardDisplayMode = boardDisplayMode
    this.configListeners.get(GameConfigListenerKey.BoardDisplayMode)?.forEach(l => l(boardDisplayMode))
  }

  setTurnMode(turnMode: GameTurnMode) {
    this.config.gameTurnMode = turnMode
    this.configListeners.get(GameConfigListenerKey.GameTurnMode)?.forEach(l => l(turnMode))
  }

  addWidget(widget: Widget, idx?: number) {
    if (idx === undefined || idx >= this.config.widgets.size) {
      // append
      this.config.widgets.set(widget.id, widget)
    }
    else {
      // insert
      const widgetIds = [...this.config.widgets.keys()]
      let off = 0
      for (let i=0; i+off < widgetIds.length; i++) {
        if (i === idx) {
          this.config.widgets.set(widget.id, widget)
          off = -1
        }
        else {
          const id = widgetIds[i + off]
          const configWidget = this.config.widgets.get(id)!
          this.config.widgets.delete(id)
          this.config.widgets.set(id, configWidget)
        }
      }
    }

    this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
  }

  deleteWidget(widgetId: string) {
    this.config.widgets.delete(widgetId)
    this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
    
    // remove child listeners of parent widget
    const widgetListeners = this.listenerWidgets.get(widgetId)
    if (widgetListeners) {
      for (const [sourceKey, targetKeys] of widgetListeners.config.entries()) {
        targetKeys.forEach(targetKey => {
          this.configListeners.get(sourceKey as GameConfigListenerKey)?.delete(targetKey)
        })
      }
      for (const [sourceKey, targetKeys] of widgetListeners.state.entries()) {
        targetKeys.forEach(targetKey => {
          this.stateListeners.get(sourceKey as GameStateListenerKey)?.delete(targetKey)
        })
      }
    }
    this.listenerWidgets.delete(widgetId)
  }

  /**
   * @param widgets Updated widgets list. Leave `undefined` to invoke listeners without updating config.
   */
  setWidgets(widgets?: WidgetExport[]) {
    if (widgets !== undefined) {
      this.config.widgets.clear()
      this.config.widgets = new Map(widgets.map((widgetExport) => {
        const widget = new Widget(widgetExport)
        return [widgetExport.id, widget]
      }))
    }
    
    this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
  }

  updateConfig(configEvent: ConfigEvent) {
    if (configEvent.boardDisplayMode !== undefined) {
      this.setBoardDisplayMode(configEvent.boardDisplayMode)
    }
    if (configEvent.gameTurnMode !== undefined) {
      this.setTurnMode(configEvent.gameTurnMode)
    }
    if (configEvent.playerCount !== undefined) {
      this.setPlayerCount(configEvent.playerCount)
    }
    if (configEvent.widgets !== undefined) {
      this.setWidgets(configEvent.widgets)
    }
    if (configEvent.deviceAliases !== undefined) {
      configEvent.deviceAliases.forEach(([id, alias]) => this.addDevice(id, alias))
    }
  }

  /**
   * @returns Game host device id.
   */
  getDeviceId() {
    return this.state.deviceId
  }

  getCommandWidgetId() {
    const commandWidgetId = this.state.commandWidgetId
    return (
      commandWidgetId === '' ? undefined : commandWidgetId
    )
  }

  setCommandWidgetId(commandWidgetId: string) {
    this.state.commandWidgetId = commandWidgetId
    this.stateListeners.get(GameStateListenerKey.CommandWidgetId)?.forEach(l => l(commandWidgetId))
  }

  getCommandCount() {
    return this.state.commandCount
  }

  /**
   * @param commandCount 
   * @param invokeListeners 
   */
  setCommandCount(commandCount: number, invokeListeners: boolean = true) {
    this.state.commandCount = commandCount
    if (invokeListeners) {
      this.stateListeners.get(GameStateListenerKey.CommandWidgetId)?.forEach(l => l(this.state.commandWidgetId))
    }
  }

  /**
   * Returns {@linkcode GameState.commandDelay | Game.state.commandDelay}.
   * 
   * @param includeWidgetDuration Include widget duration as component of sum. Default `true`.
   */
  getCommandDelay(includeWidgetDuration = true) {
    const extensions: number[] = []
    if (includeWidgetDuration) {
      const widget = this.config.widgets.get(this.state.commandWidgetId)!
      extensions.push(widget.duration)
    }

    return this.state.commandDelay + extensions.reduce((sum, val) => sum + val)
  }

  setCommandDelay(commandDelay: number, invokeListeners: boolean = true) {
    this.state.commandDelay = commandDelay
    if (invokeListeners) {
      this.stateListeners.get(GameStateListenerKey.CommandWidgetId)?.forEach(l => l(this.state.commandWidgetId))
    }
  }

  /**
   * Returns {@linkcode GameState.turnPlayerIdx | Game.state.turnPlayerIdx}.
   */
  getTurnPlayerIdx() {
    return this.state.turnPlayerIdx
  }

  /**
   * Returns {@linkcode GameState.turnCommandCountTotal | Game.state.turnCommandCountTotal}.
   */
  getTurnCommandCountTotal() {
    return this.state.turnCommandCountTotal
  }

  /**
   * Returns {@linkcode GameState.turnCommandCount | Game.state.turnCommandCount}.
   */
  getTurnCommandCount() {
    return this.state.turnCommandCount
  }

  setTurn(turnPlayerIdx: number, turnCommandCountTotal: number) {
    this.state.turnPlayerIdx = turnPlayerIdx
    this.state.turnCommandCountTotal = turnCommandCountTotal
    this.stateListeners.get(GameStateListenerKey.TurnPlayerIdx)?.forEach(l => l(turnPlayerIdx))
  }

  /**
   * Sets {@linkcode GameState.turnCommandCount | Game.state.turnCommandCount}.
   */
  setTurnCommandCount(turnCommandCount: number, invokeListeners: boolean = true) {
    this.state.turnCommandCount = turnCommandCount
    if (invokeListeners) {
      this.stateListeners.get(GameStateListenerKey.TurnPlayerIdx)?.forEach(l => l(this.state.turnPlayerIdx))
    }
  }

  /**
   * Schedule a method for when a game has been idle without starting for too long.
   * Replaces any earlier start timeout if exists.
   * 
   * @param onTimeout Callback for if game start delay exceeds max.
   */
  setStartTimeout(onTimeout: () => void): number {
    this.startTimeout = setTimeout(onTimeout, gameStartDelayMax)
    return gameStartDelayMax
  }

  /**
   * Maintain the same start callback, but reset its delay timer.
   */
  refreshStartTimeout() {
    this.startTimeout?.refresh()
  }

  /**
   * Schedule a method for when a game delete was requested without any request to recover it. 
   * @param onTimeout Callback for if delete delay exceeds max.
   */
  setDeleteTimeout(onTimeout: () => void): number {
    this.deleteTimeout = setTimeout(onTimeout, gameDeleteDelay)
    return gameDeleteDelay
  }

  /**
   * Maintain the same delete callback, but reset its delay timer.
   */
  refreshDeleteTimeout() {
    this.deleteTimeout?.refresh()
  }

  protected addListenerWidget(
    type: 'config'|'state', 
    widgetId: WidgetId, 
    sourceKey: GameAnyListenerKey, 
    targetKey: string
  ) {
    // register widget
    if (!this.listenerWidgets.has(widgetId)) {
      this.listenerWidgets.set(widgetId, {
        config: new Map(), 
        state: new Map()
      })
    }
    // register source key
    const widgetListeners = this.listenerWidgets.get(widgetId)![type]
    if (!widgetListeners.has(sourceKey)) {
      widgetListeners.set(sourceKey, new Set())
    }
    // register target key
    widgetListeners.get(sourceKey)!.add(targetKey)
  }

  addConfigListener(configKey: GameConfigListenerKey, listenerKey: string, listener: StateListener, widgetId?: WidgetId) {
    this.configListeners.get(configKey)?.set(listenerKey, listener)
    if (widgetId) {
      this.addListenerWidget('config', widgetId, configKey, listenerKey)
    }
  }
  
  addStateListener(stateKey: GameStateListenerKey, listenerKey: string, listener: StateListener, widgetId?: WidgetId) {
    this.stateListeners.get(stateKey)?.set(listenerKey, listener)
    if (widgetId) {
      this.addListenerWidget('state', widgetId, stateKey, listenerKey)
    }
  }

  /**
   * @returns Serialized game config as URL search params. Excludes game id.
   */
  public save() {
    const urlParams = new URLSearchParams()
    urlParams.set('boardDisplayMode', this.config.boardDisplayMode)
    urlParams.set('gameTurnMode', this.config.gameTurnMode)
    urlParams.set('players.count', this.config.players.count.toString())
    urlParams.set('difficulty', this.config.difficulty.toString())
    this.config.widgets.forEach(w => {
      urlParams.append('widget', Widget.save(w))
    })

    return urlParams
  }

  /**
   * Persist game to window url search params. 
   * Skips window url update if run on server.
   * 
   * @returns Url search params.
   */
  public saveToWindowLocation() {
    const urlParams = this.save()
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '?' + urlParams.toString())
    }

    return urlParams
  }

  /**
   * Start game, send first command.
   * 
   * This is an event sender method, called by the game host. 
   * Does not call `setStarted`, which is an event recipient method.
   * 
   * @param listener Game event handler that propagates to client pages.
   * @param deviceId Device hosting the game (server if multi device, client if single device).
   * @returns Game start event.
   */
  public start(listener: GameEventListener, deviceId: string): GameEvent {
    this.state.deviceId = deviceId
    this.state.lastEventType = GameEventType.Start

    // reset state
    this.state.started = true
    this.state.commandCount = 0
    this.state.commandDelay = commandDelayDefault
    this.state.turnPlayerIdx = -1
    this.state.turnCommandCountTotal = 0
    this.state.turnCommandCount = -1
    this.state.ended = false
    this.state.endReason = GameEndReason.Unknown

    if (this.startTimeout !== null) {
      clearTimeout(this.startTimeout)
      this.startTimeout = null
    }
    if (this.deleteTimeout !== null) {
      clearTimeout(this.deleteTimeout)
      this.deleteTimeout = null
    }
    
    const start: GameEvent = {
      deviceId,
      gameId: this.id,
      gameEventType: this.state.lastEventType
    }
    listener(start)

    // send first command
    this.sendCommand(listener)

    return start
  }

  protected sendTurn(listener: GameEventListener) {
    this.state.turnPlayerIdx = (this.state.turnPlayerIdx+1) % this.config.players.count
    this.state.turnCommandCount = 0
    this.state.turnCommandCountTotal = Math.round(
      Math.random() * (turnCommandCountMax-turnCommandCountMin) 
      + turnCommandCountMin
    )

    // send turn event
    const turn: TurnEvent = {
      deviceId: this.state.deviceId!,
      gameId: this.id,
      gameEventType: GameEventType.Turn,
      turnPlayerIdx: this.state.turnPlayerIdx,
      turnCommandCountTotal: this.state.turnCommandCountTotal
    }
    listener(turn)
  }

  protected sendCommand(listener: GameEventListener) {
    this.state.lastEventType = GameEventType.Command

    // select a random widget
    const commandWidgetIdx = Math.round(Math.random() * (this.config.widgets.size-1))
    this.state.commandWidgetId = [...this.config.widgets.keys()][commandWidgetIdx]

    // turn-mode compete: handle turn
    if (this.config.gameTurnMode === GameTurnMode.Competitive) {
      if (this.state.turnCommandCount >= this.state.turnCommandCountTotal || this.state.turnCommandCount < 0) {
        // new turn
        this.sendTurn(listener)
      }
    }

    // send command
    const command: CommandEvent = {
      deviceId: this.state.deviceId!,
      gameId: this.id,
      gameEventType: this.state.lastEventType,
      widgetId: this.state.commandWidgetId,
      command: this.config.widgets.get(this.state.commandWidgetId)!.command,
      commandDelay: this.state.commandDelay,
      commandCount: ++this.state.commandCount,
      turnCommandCount: ++this.state.turnCommandCount
    }
    listener(command)

    // prepare for next command
    const totalDelay = this.getCommandDelay(true)

    const widgetType = this.config.widgets.get(this.state.commandWidgetId)!.type
    if (widgetType === WidgetType.Wait) {
      // wait for next command, otherwise will end game on doWidget
      this.state.commandTimeout = setTimeout(
        () => this.sendCommand(listener),
        totalDelay
      )
    }
    else {
      // wait for doWidget, end game on timeout
      this.state.commandTimeout = setTimeout(
        () => this.end(GameEndReason.ActionDelay, listener, this.state.deviceId!), 
        totalDelay
      )
    }

    const commandDelayVelocity = 100 * this.config.difficulty
    this.state.commandDelay = Math.max(this.state.commandDelay - commandDelayVelocity, commandDelayMin)
  }

  public doWidget(event: DoWidgetEvent, listener: GameEventListener) {
    this.state.lastEventType = GameEventType.DoWidget

    // stop waiting
    if (this.state.commandTimeout !== null) {
      clearTimeout(this.state.commandTimeout)
    }

    
    if (
      // confirm whether widget matches last command
      event.widgetId === this.state.commandWidgetId
      // and last command was not a wait
      && this.config.widgets.get(this.state.commandWidgetId)!.type !== WidgetType.Wait
    ) {
      // send next command
      this.sendCommand(listener)
    }
    else {
      // wrong widget; end game
      this.end(GameEndReason.ActionMismatch, listener, this.state.deviceId!)
    }
  }

  /**
   * End game.
   * 
   * @param listener 
   * @param deviceId Device that emits end event. Does not use instance var in case this game was never started.
   */
  public end(reason: GameEndReason, listener: GameEventListener, deviceId: string) {
    this.state.lastEventType = GameEventType.End
    this.state.ended = true
    this.state.endReason = reason

    const event: EndEvent = {
      deviceId,
      gameId: this.id,
      gameEventType: this.state.lastEventType,
      commandCount: this.state.commandCount,
      endReason: reason
    }
    listener(event)
  }

  public toString() {
    return `Game[id=${this.id}]`
  }

  static saveGameId(gameId: GameId, urlParams: URLSearchParams) {
    urlParams.set('id', gameId)
  }

  static loadGameId(urlParams: URLSearchParams) {
    return urlParams.get('id') || urlParams.get('gameId') || undefined
  }

  static loadGame(urlParams: URLSearchParams, id?: GameId) {
    return new Game(id, {
      boardDisplayMode: urlParams.get('boardDisplayMode') as BoardDisplayMode || BoardDisplayMode.Default,
      gameTurnMode: urlParams.get('gameTurnMode') as GameTurnMode || BoardDisplayMode.Default,
      players: {
        count: parseInt(urlParams.get('players.count') || '1')
      },
      difficulty: parseFloat(urlParams.get('difficulty') || '0.5'),
      widgets: new Map(
        urlParams.getAll('widget')
        // deserialize
        .map(Widget.load)
        // list to map
        .map((w) => [w.id, w])
      )
    })
  }

  private static generateId(): GameId {
    return ulid()
  }
}