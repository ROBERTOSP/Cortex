import { normalizeTaxonomyKey, resolveBoardAlias } from './taxonomy-aliases';

describe('taxonomy aliases', () => {
  it('normaliza variações tipográficas para uma chave estável', () => {
    expect(normalizeTaxonomyKey(' Fundação  Getúlio-Vargas ')).toBe('fundacao getulio vargas');
  });

  it('resolve a origem para a banca canônica sem apagar o valor bruto', () => {
    expect(resolveBoardAlias('Centro de Seleção e de Promoção de Eventos UnB')).toEqual({
      sourceName: 'Centro de Seleção e de Promoção de Eventos UnB',
      canonical: { id: 'cebraspe', name: 'Cebraspe' },
    });
  });
});
