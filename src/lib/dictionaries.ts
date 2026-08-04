import 'server-only'

const dictionaries = {
  pt: {
    login: () => import('@/dictionaries/login/pt.json').then((module) => module.default),
    dashboard: () => import('@/dictionaries/dashboard/pt.json').then((module) => module.default),
    pack: () => import('@/dictionaries/pack/pt.json').then((module) => module.default),
  },
  es: {
    login: () => import('@/dictionaries/login/es.json').then((module) => module.default),
    dashboard: () => import('@/dictionaries/dashboard/es.json').then((module) => module.default),
    pack: () => import('@/dictionaries/pack/es.json').then((module) => module.default),
  },
  en: {
    login: () => import('@/dictionaries/login/en.json').then((module) => module.default),
    dashboard: () => import('@/dictionaries/dashboard/en.json').then((module) => module.default),
    pack: () => import('@/dictionaries/pack/en.json').then((module) => module.default),
  },
}

export type Locale = keyof typeof dictionaries
export type DictionaryPage = keyof typeof dictionaries['pt']

export const getDictionary = async <T extends DictionaryPage>(locale: Locale, page: T) => {
  return dictionaries[locale]?.[page]() ?? dictionaries['pt'][page]()
}
