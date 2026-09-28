import { useCallback } from 'react';
import usePreferencias from './usePreferencias';
import { translations, getLocaleFromIdioma } from '../i18n/translations';

type TranslationKey = string;

export default function useI18n() {
  const { prefs, atualizar } = usePreferencias();
  const idioma = prefs?.idioma || 'Português (Brasil)';
  const locale = getLocaleFromIdioma(idioma);

  const t = useCallback(
    (key: TranslationKey, fallback: string = '') => {
      const dict = translations[idioma as keyof typeof translations] || translations['Português (Brasil)'];
      // @ts-ignore - Indexing dynamically
      return dict?.[key] ?? fallback ?? key;
    },
    [idioma],
  );

  return {
    t,
    idioma,
    locale,
    setIdioma: (novoIdioma: string) => atualizar('idioma', novoIdioma),
  };
}
