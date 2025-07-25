export enum Locale {
  English = 'eng',
  Spanish = 'spa'
}

export const cookieLocale = 'locale'
export const defaultLocale: Locale = Locale.English

export enum StringsNamespace {
  Footer = 'footer'
}

const internationalStrings = new Map([
  [Locale.English, new Map([
    [StringsNamespace.Footer, new Map([
      ['selectLanguage', 'Change language.']
    ])]
  ])],
  [Locale.Spanish, new Map([
    [StringsNamespace.Footer, new Map([
      ['selectLanguage', 'Cambiar idioma.']
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
    return strings.get(key) || `error string ${key} missing`
  })
}
