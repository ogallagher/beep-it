import { ulid } from 'ulid'
import Widget from '@lib/widget/widget'
import { CommandEvent, ConfigEvent, DoWidgetEvent, EndEvent, GameEvent, GameEventListener, GameEventType } from './gameEvent'
import { BoardDisplayMode, GameTurnMode, GameConfigListenerKey, GameStateListenerKey, commandDelayMin, ConfigListener, GameConfig, gameStartDelayMax, GameState, StateListener } from './const'
import { WidgetExport } from '@lib/widget/const'

export default class Game {
  public id: string
  /**
   * Attributes of a game that become static on start.
   * 
   * Public in order to bypass configListeners when changes come from local client.
   */
  public config: GameConfig
  protected state: GameState = {
    commandCount: 0,
    commandDelay: 3000,
    commandTimeout: null,
    commandWidgetId: '',
    lastEventType: GameEventType.Pending,
    started: false,
    /**
     * The client device that is hosting the game (first to join).
     */
    deviceId: null,
    devices: {
      count: 1,
      ids: new Set()
    }
  }
  protected startTimeout: NodeJS.Timeout | null = null
  protected configListeners: Map<string, ConfigListener[]> = new Map([
    [GameConfigListenerKey.PlayersCount, []],
    [GameConfigListenerKey.Widgets, []],
    [GameConfigListenerKey.BoardDisplayMode, []],
    [GameConfigListenerKey.GameTurnMode, []]
  ])
  protected stateListeners: Map<string, StateListener[]> = new Map([
    [GameStateListenerKey.DevicesCount, []]
  ])

  constructor(id?: string | null, config?: GameConfig) {
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
   * Append to devices list. Internally calls `setDeviceCount`.
   * 
   * @param deviceId 
   */
  addDevice(deviceId: string) {
    this.state.devices.ids.add(deviceId)
    this.setDeviceCount(this.state.devices.ids.size)
  }

  /**
   * Replace devices list. Internally calls `setDeviceCount`.
   * 
   * @param deviceIds 
   */
  setDevices(deviceIds: Iterable<string>) {
    this.state.devices.ids = new Set(deviceIds)
    this.setDeviceCount(this.state.devices.ids.size)
  }

  getStarted() {
    return this.state.started
  }

  setStarted(started: boolean) {
    this.state.started = started
    this.stateListeners.get(GameStateListenerKey.Started)?.forEach(l => l(started))
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

  addWidget(widget: Widget) {
    this.config.widgets.set(widget.id, widget)
    this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
  }

  deleteWidget(widgetId: string) {
    this.config.widgets.delete(widgetId)
    this.configListeners.get(GameConfigListenerKey.Widgets)?.forEach(l => l(this.config.widgets))
  }

  setWidgets(widgets: WidgetExport[]) {
    this.config.widgets.clear()
    this.config.widgets = new Map(widgets.map((widgetExport) => {
      const widget = new Widget(widgetExport)
      return [widgetExport.id, widget]
    }))
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
    if (configEvent.boardDisplayMode !== undefined) {
      this.setBoardDisplayMode(configEvent.boardDisplayMode)
    }
    if (configEvent.gameTurnMode !== undefined) {
      this.setTurnMode(configEvent.gameTurnMode)
    }
    if (configEvent.widgets !== undefined) {
      this.setWidgets(configEvent.widgets)
    }
  }

  /**
   * @returns Game host device id.
   */
  getDeviceId() {
    return this.state.deviceId
  }

  setStartTimeout(onTimeout: () => void): number {
    this.startTimeout = setTimeout(onTimeout, gameStartDelayMax)
    return gameStartDelayMax
  }

  addConfigListener(configKey: string, listener: StateListener) {
    this.configListeners.get(configKey)?.push(listener)
  }

  addStateListener(stateKey: string, listener: StateListener) {
    this.stateListeners.get(stateKey)?.push(listener)
  }

  /**
   * @returns Serialized game as URL search params.
   */
  public save() {
    const urlParams = new URLSearchParams()
    Game.saveGameId(this.id, urlParams)
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
   * @param listener Game event handler that propogates to client pages.
   * @param deviceId Device hosting the game (server if multi device, client if single device).
   * @returns Game start event.
   */
  public start(listener: GameEventListener, deviceId: string): GameEvent {
    this.state.deviceId = deviceId
    this.state.lastEventType = GameEventType.Start

    if (this.startTimeout !== null) {
      clearTimeout(this.startTimeout)
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

  protected sendCommand(listener: GameEventListener) {
    this.state.lastEventType = GameEventType.Command

    // select a random widget
    const commandWidgetIdx = Math.round(Math.random() * this.config.widgets.size-1)
    this.state.commandWidgetId = [...this.config.widgets.keys()][commandWidgetIdx]

    // send command
    const command: CommandEvent = {
      deviceId: this.state.deviceId!,
      gameId: this.id,
      gameEventType: this.state.lastEventType,
      widgetId: this.state.commandWidgetId,
      command: this.config.widgets.get(this.state.commandWidgetId)!.command
    }
    listener(command)

    // prepare for next command
    this.state.commandCount++

    const commandDelayVelocity = 100 * this.config.difficulty
    this.state.commandDelay = Math.max(this.state.commandDelay - commandDelayVelocity, commandDelayMin)

    // wait for doWidget
    this.state.commandTimeout = setTimeout(
      () => this.end(listener, this.state.deviceId!), 
      this.state.commandDelay
    )
  }

  protected doWidget(event: DoWidgetEvent, listener: GameEventListener) {
    this.state.lastEventType = GameEventType.DoWidget

    // stop waiting
    if (this.state.commandTimeout !== null) {
      clearTimeout(this.state.commandTimeout)
    }

    // confirm whether widget matches last command
    if (event.widgetId === this.state.commandWidgetId) {
      // send next command
      this.sendCommand(listener)
    }
    else {
      // wrong widget; end game
      this.end(listener, this.state.deviceId!)
    }
  }

  /**
   * End game.
   * 
   * @param listener 
   * @param deviceId Device that emits end event. Does not use instance var in case this game was never started.
   */
  public end(listener: GameEventListener, deviceId: string) {
    this.state.lastEventType = GameEventType.End
    const event: EndEvent = {
      deviceId,
      gameId: this.id,
      gameEventType: this.state.lastEventType,
      commandCount: this.state.commandCount
    }
    listener(event)
  }

  public toString() {
    return `Game[id=${this.id}]`
  }

  static saveGameId(gameId: string, urlParams: URLSearchParams) {
    urlParams.set('id', gameId)
  }

  static loadGameId(urlParams: URLSearchParams) {
    return urlParams.get('id') || undefined
  }

  static loadGame(urlParams: URLSearchParams) {
    const id = Game.loadGameId(urlParams)

    if (id !== undefined) {
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
    else {
      return undefined
    }
  }

  private static generateId() {
    return ulid()
  }
}