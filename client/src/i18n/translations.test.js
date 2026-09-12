import { describe, it, expect } from 'vitest';
import { translations, getLocaleFromIdioma, IDIOMAS_SUPORTADOS } from './translations';

describe('i18n translations dictionary', () => {
  it('deve possuir suporte aos três idiomas definidos', () => {
    expect(translations[IDIOMAS_SUPORTADOS.PT]).toBeDefined();
    expect(translations[IDIOMAS_SUPORTADOS.EN]).toBeDefined();
    expect(translations[IDIOMAS_SUPORTADOS.ES]).toBeDefined();
  });

  it('deve ter paridade nas chaves principais de tradução entre todos os idiomas', () => {
    const chavesPt = Object.keys(translations[IDIOMAS_SUPORTADOS.PT]).sort();
    const chavesEn = Object.keys(translations[IDIOMAS_SUPORTADOS.EN]).sort();
    const chavesEs = Object.keys(translations[IDIOMAS_SUPORTADOS.ES]).sort();

    expect(chavesEn).toEqual(chavesPt);
    expect(chavesEs).toEqual(chavesPt);
  });

  it('deve mapear corretamente os locales por idioma', () => {
    expect(getLocaleFromIdioma(IDIOMAS_SUPORTADOS.PT)).toBe('pt-BR');
    expect(getLocaleFromIdioma(IDIOMAS_SUPORTADOS.EN)).toBe('en-US');
    expect(getLocaleFromIdioma(IDIOMAS_SUPORTADOS.ES)).toBe('es-ES');
    expect(getLocaleFromIdioma('Desconhecido')).toBe('pt-BR');
  });
});
