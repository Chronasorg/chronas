import { englishMessages } from 'admin-on-rest'
import arabicMessages from 'aor-language-arabic'
import frenchMessages from 'aor-language-french'
import chineseMessages from 'aor-language-chinese'
import dutchMessages from 'aor-language-dutch'
import germanMessages from 'aor-language-german'
import greekMessages from 'aor-language-greek'
import italianMessages from 'aor-language-italian'
import japaneseMessages from 'aor-language-japanese'
import polishMessages from 'aor-language-polish'
import russianMessages from 'aor-language-russian'
import spanishMessages from 'aor-language-spanish'
import swedishMessages from 'aor-language-swedish'
import vietnameseMessages from 'aor-language-vietnamese'

import customArabicMessages from './ar'
import customFrenchMessages from './fr'
import customEnglishMessages from './en'
import customChineseMessages from './zh'
import customDutchMessages from './nl'
import customGermanMessages from './de'
import customGreekMessages from './el'
import customItalianMessages from './it'
// import customTurkishMessages from './tr'
import customJapaneseMessages from './ja'
import customPolishMessages from './pl'
import customPortugeseMessages from './pt'
import customRussianMessages from './ru'
import customSpanishMessages from './es'
import customHindiMessages from './hi'
import customSwedishMessages from './sv'
import customVietnameseMessages from './vi'

export default {
  ar: { ...arabicMessages, ...customEnglishMessages },
  ca: { ...englishMessages, ...customEnglishMessages },
  fr: { ...frenchMessages, ...customFrenchMessages },
  en: { ...englishMessages, ...customEnglishMessages },
  zh: { ...chineseMessages, ...customChineseMessages },
  nl: { ...dutchMessages, ...customEnglishMessages },
  de: { ...germanMessages, ...customGermanMessages },
  el: { ...greekMessages, ...customEnglishMessages },
  hi: { ...englishMessages, ...customEnglishMessages },
  tr: { ...englishMessages, ...customEnglishMessages },
  it: { ...italianMessages, ...customEnglishMessages },
  ja: { ...japaneseMessages, ...customEnglishMessages },
  pl: { ...polishMessages, ...customEnglishMessages },
  pt: { ...englishMessages, ...customPortugeseMessages },
  ru: { ...russianMessages, ...customRussianMessages },
  es: { ...spanishMessages, ...customSpanishMessages },
  sv: { ...swedishMessages, ...customEnglishMessages },
  vi: { ...vietnameseMessages, ...customEnglishMessages },
}
