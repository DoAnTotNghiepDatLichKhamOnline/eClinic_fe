export type Lang = 'en' | 'vi'

/** A piece of copy authored in both supported languages at once,
 *  so English and Vietnamese content can never drift out of sync. */
export interface Bilingual {
  en: string
  vi: string
}
