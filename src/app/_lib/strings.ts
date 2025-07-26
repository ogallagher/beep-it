export enum Locale {
  English = 'eng',
  Spanish = 'spa',
  Korean = 'kor'
}

export const cookieLocale = 'locale'
export const defaultLocale: Locale = Locale.English

export enum StringsNamespace {
  Footer = 'footer',
  GameDevice = 'devices',
  GamePlayers = 'players',
  BoardMode = 'boardMode',
  TurnMode = 'turnMode',
  DeviceFeatures = 'deviceFeatures',
  Play = 'play',
  Preview = 'preview',
  RandomWidget = 'randomWidget',
  RejoinGame = 'rejoin',
  WidgetCount = 'widgetCount',
  WidgetsDrawerControl = 'widgetsDrawerControl',
  Save = 'save',
  Share = 'share'
}

const internationalStrings = new Map([
  [Locale.English, new Map([
    [StringsNamespace.Footer, new Map([
      ['selectLanguage', 'Change language.']
    ])],
    [StringsNamespace.GameDevice, new Map([
      ['deviceCount', 'device count'],
      ['manageDevices', 'Manage devices.'],
      ['manageDevice', 'Manage device'],
      ['self', 'self']
    ])],
    [StringsNamespace.GamePlayers, new Map([
      ['playerCount', 'player count']
    ])],
    [StringsNamespace.BoardMode, new Map([
      ['boardMode', 'board mode'],
      ['extend', 'extend'],
      ['mirror', 'mirror'],
      ['extendTitle', 'Extend - Distribute widgets across devices as a single shared board.' ],
      ['mirrorTitle', 'Mirror - Each device displays its board with a copy of the widgets.']
    ])],
    [StringsNamespace.TurnMode, new Map([
      ['turnMode', 'turn mode'],
      ['collab', 'collab'],
      ['compete', 'compete'],
      ['collabTitle', 'Collab - Any player can do a widget at any time.'],
      ['competeTitle', 'Compete - Players take turns and loser is eliminated.']
    ])],
    [StringsNamespace.DeviceFeatures, new Map([
      ['keyboard', 'use physical keyboard'],
      ['touch', 'use touch screen']
    ])],
    [StringsNamespace.Play, new Map([
      ['playTitle', 'Start new game']
    ])],
    [StringsNamespace.Preview, new Map([
      ['closePreview', 'Open game controls, close preview.'],
      ['openPreview', 'Preview board during gameplay.']
    ])],
    [StringsNamespace.RandomWidget, new Map([
      ['title', 'Add a random widget to the board']
    ])],
    [StringsNamespace.RejoinGame, new Map([
      ['title', 'Rejoin game']
    ])],
    [StringsNamespace.WidgetCount, new Map([
      ['title', 'count of widgets in the board']
    ])],
    [StringsNamespace.WidgetsDrawerControl, new Map([
      ['close', 'Close widgets drawer'],
      ['open', 'Add widgets to the board']
    ])],
    [StringsNamespace.Save, new Map([
      ['title', 'Save game config link to load the same board later.']
    ])],
    [StringsNamespace.Share, new Map([
      ['title', 'Share game link to add devices to the board.']
    ])]
  ])],
  [Locale.Spanish, new Map([
    [StringsNamespace.Footer, new Map([
      ['selectLanguage', 'Cambiar idioma.']
    ])],
    [StringsNamespace.GameDevice, new Map([
      ['deviceCount', 'dispositivos'],
      ['manageDevices', 'Gestionar dispositivos.'],
      ['manageDevice', 'Gestionar dispositivo'],
      ['self', 'yo']
    ])],
    [StringsNamespace.GamePlayers, new Map([
      ['playerCount', 'jugadores']
    ])],
    [StringsNamespace.BoardMode, new Map([
      ['boardMode', 'modo de tablero'],
      ['extend', 'extensión'],
      ['mirror', 'espejo'],
      ['extendTitle', 'Extensión - Distribuir controles por pantallas como tablero única compartida.'],
      ['mirrorTitle', 'Espejo - Cada pantalla muestra su tablero con una copia de los controles.']
    ])],
    [StringsNamespace.TurnMode, new Map([
      ['turnMode', 'modo de turno'],
      ['collab', 'colabo'],
      ['compete', 'competi'],
      ['collabTitle', 'Colaborativo - Cualquier jugador puede actuar en cualquier momento.'],
      ['competeTitle', 'Competitivo - Jugadores van turnando y el que pierda se elimina.']
    ])],
    [StringsNamespace.DeviceFeatures, new Map([
      ['keyboard', 'usar teclado físico'],
      ['touch', 'usar pantalla táctil']
    ])],
    [StringsNamespace.Play, new Map([
      ['playTitle', 'Arrancar juego']
    ])],
    [StringsNamespace.Preview, new Map([
      ['closePreview', 'Configurar juego, cerrar vista previa.'],
      ['openPreview', 'Vista previa de tablero activa.']
    ])],
    [StringsNamespace.RandomWidget, new Map([
      ['title', 'Agregar control aleatorio a la tablero']
    ])],
    [StringsNamespace.RejoinGame, new Map([
      ['title', 'Reconectar a juego']
    ])],
    [StringsNamespace.WidgetCount, new Map([
      ['title', 'conteo de controles en la tablero']
    ])],
    [StringsNamespace.WidgetsDrawerControl, new Map([
      ['close', 'Cerrar bandeja de controles'],
      ['open', 'Agregar controles al tablero']
    ])],
    [StringsNamespace.Save, new Map([
      ['title', 'Enlace de guardar config de juego para luego empezar con el mismo tablero.']
    ])],
    [StringsNamespace.Share, new Map([
      ['title', 'Enlace de compartir juego para agregar más dispositivos.']
    ])]
  ])],
  [Locale.Korean, new Map([
    [StringsNamespace.Footer, new Map([
      ['selectLanguage', '언어 바꾸기']
    ])],
    [StringsNamespace.GameDevice, new Map([
      ['deviceCount', '기기 수'],
      ['manageDevices', '기기 관리'],
      ['manageDevice', '기기 수정'],
      ['self', '자신']
    ])],
    [StringsNamespace.GamePlayers, new Map([
      ['playerCount', '선수 인원']
    ])],
    [StringsNamespace.BoardMode, new Map([
      ['boardMode', '보드 모드'],
      ['extend', '확장'],
      ['mirror', '복제'],
      ['extendTitle', '확장 - 공유의 단일 화면이듯이 입력장치들이 화면들 간에 나눠 배치됨'],
      ['mirrorTitle', '복제 - 화면마다 각자의 보드에 입력장치들이 모두 표시됨']
    ])],
    [StringsNamespace.TurnMode, new Map([
      ['turnMode', '차례 모드'],
      ['collab', '통합'],
      ['compete', '경쟁'],
      ['collabTitle', '통합 - 아무 선수나 아무 때나 한수를 할 수 있음'],
      ['competeTitle', '경쟁 - 선수들 차례로 행동하고서 패자 탈락됨.']
    ])],
    [StringsNamespace.DeviceFeatures, new Map([
      ['keyboard', '물질적 자판 사용'],
      ['touch', '터치스크린 사용']
    ])],
    [StringsNamespace.Play, new Map([
      ['playTitle', '경기 시작']
    ])],
    [StringsNamespace.Preview, new Map([
      ['closePreview', '게임 설정하느라 미리보기 닫기'],
      ['openPreview', '경기 중의 보드 미리보기 열기']
    ])],
    [StringsNamespace.RandomWidget, new Map([
      ['title', '임의 입력장치를 보드에 추가']
    ])],
    [StringsNamespace.RejoinGame, new Map([
      ['title', '게임 접근 회복']
    ])],
    [StringsNamespace.WidgetCount, new Map([
      ['title', '보드에 있는 입력장치 수']
    ])],
    [StringsNamespace.WidgetsDrawerControl, new Map([
      ['close', '입력장치 서랍 닫기'],
      ['open', '입력장치 서랍 열기']
    ])],
    [StringsNamespace.Save, new Map([
      ['title', '나중에 같은 보드로 시작할 게임 설정 저장 링크']
    ])],
    [StringsNamespace.Share, new Map([
      ['title', '또한 기기 화면을 추가할 경기 공유 링크']
    ])]
  ])]
])

export function getLocales() {
  return internationalStrings.keys()
}

export function getLocaleName(locale: Locale) {
  switch (locale) {
    case Locale.English:
      return 'english'
    case Locale.Spanish:
      return 'español'
    case Locale.Korean:
      return '한국어'
  }
}

export default function getStrings(locale: Locale, namespace: StringsNamespace) {
  if (!internationalStrings.has(locale)) {
    locale = defaultLocale
  }
  const strings = internationalStrings.get(locale)!.get(namespace)!
  if (strings === undefined) {
    throw new Error(`strings error ns=${namespace}`)
  }

  return ((key: string) => {
    return (
      strings.get(key) 
      || internationalStrings.get(defaultLocale)!.get(namespace)!.get(key))
      || `strings error key=${key}`
  })
}
