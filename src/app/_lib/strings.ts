export enum Locale {
  English = 'eng',
  Spanish = 'spa'
}

export const cookieLocale = 'locale'
export const defaultLocale: Locale = Locale.English

export enum StringsNamespace {
  Footer = 'footer',
  GameDevice = 'devices',
  GamePlayers = 'players',
  BoardMode = 'boardMode',
  TurnMode = 'turnMode'
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
      ['boardMode', 'modo de tabla'],
      ['extend', 'extensión'],
      ['mirror', 'espejo'],
      ['extendTitle', 'Extensión - Distribuir controles por pantallas como tabla única compartida.'],
      ['mirrorTitle', 'Espejo - Cada pantalla muestra su tabla con una copia de los controles.']
    ])],
    [StringsNamespace.TurnMode, new Map([
      ['turnMode', 'modo de turno'],
      ['collab', 'colabo'],
      ['compete', 'competi'],
      ['collabTitle', 'Colaborativo - Cualquier jugador puede actuar en cualquier momento.'],
      ['competeTitle', 'Competitivo - Jugadores van turnando y el que pierda se elimina.']
    ])]
  ])]
])

export function getLocales() {
  return internationalStrings.keys()
}

export default function getStrings(locale: Locale, namespace: StringsNamespace) {
  if (!internationalStrings.has(locale)) {
    locale = defaultLocale
  }
  const strings = internationalStrings.get(locale)!.get(namespace)!

  return ((key: string) => {
    return strings.get(key) || internationalStrings.get(defaultLocale)!.get(namespace)!.get(key)
  })
}
