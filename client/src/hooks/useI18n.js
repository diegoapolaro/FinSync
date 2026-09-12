import { useCallback } from 'react';
import usePreferencias from './usePreferencias';
import { translations, getLocaleFromIdioma } from '../i18n/translations';

export default function useI18n() {
  const { prefs, atualizar } = usePreferencias();
  const idioma = prefs?.idioma || 'Português (Brasil)';
  const locale = getLocaleFromIdioma(idioma);

  const t = useCallback(
    (key, fallback = '') => {
      const dict = translations[idioma] || translations['Português (Brasil)'];
      return dict?.[key] ?? fallback ?? key;
    },
    [idioma],
  );

  return {
    t,
    idioma,
    locale,
    setIdioma: (novoIdioma) => atualizar('idioma', novoIdioma),
  };
}
