import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

type Locale = 'en' | 'hi';

const dictionaries: Record<Locale, any> = { en, hi };

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = dictionaries[locale] ? locale : 'en';
}

export function t(path: string): string {
  const parts = path.split('.');
  let node: any = dictionaries[currentLocale];
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) {
      node = node[p];
    } else {
      node = null;
      break;
    }
  }
  if (typeof node === 'string') return node;
  // fallback to en
  let fallback: any = en;
  for (const p of parts) {
    if (fallback && typeof fallback === 'object' && p in fallback) {
      fallback = (fallback as any)[p];
    } else {
      fallback = null;
      break;
    }
  }
  return typeof fallback === 'string' ? fallback : path;
}


