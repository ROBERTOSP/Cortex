export type CanonicalBoard = {
  id: string;
  name: string;
};

const BETA_BOARD_ALIASES: Array<CanonicalBoard & { aliases: string[] }> = [
  { id: 'cebraspe', name: 'Cebraspe', aliases: ['Centro de Seleção e de Promoção de Eventos UnB', 'CESPE/UnB'] },
  { id: 'vunesp', name: 'Vunesp', aliases: ['Fundação para o Vestibular da Universidade Estadual Paulista'] },
  { id: 'fundatec', name: 'Fundatec', aliases: ['Fundação Universidade Empresa de Tecnologia e Ciências'] },
  { id: 'fgv', name: 'FGV', aliases: ['Fundação Getúlio Vargas'] },
  { id: 'quadrix', name: 'Instituto Quadrix', aliases: ['Instituto Quadrix'] },
  { id: 'avanca_sp', name: 'Instituto Avança SP', aliases: ['Instituto Avança São Paulo'] },
  { id: 'objetiva', name: 'Objetiva Concursos', aliases: ['Objetiva Concursos'] },
  { id: 'fepese', name: 'FEPESE', aliases: ['Fundação de Estudos e Pesquisas Socioeconômicos'] },
  { id: 'ameosc', name: 'AMEOSC', aliases: ['Associação dos Municípios do Extremo Oeste de Santa Catarina'] },
  { id: 'aocp', name: 'Instituto AOCP', aliases: ['Instituto AOCP'] },
  { id: 'consulplan', name: 'Instituto Consulplan', aliases: ['Instituto Consulplan'] },
  { id: 'fcc', name: 'Fundação Carlos Chagas', aliases: ['Fundação Carlos Chagas'] },
  { id: 'ibfc', name: 'IBFC', aliases: ['Instituto Brasileiro de Formação e Capacitação'] },
  { id: 'ibade', name: 'IBADE', aliases: ['Instituto Brasileiro de Apoio e Desenvolvimento Executivo'] },
  { id: 'selecon', name: 'Selecon', aliases: ['SELECON Instituto Nacional de Seleções e Concursos'] },
  { id: 'iades', name: 'IADES', aliases: ['Instituto Americano de Desenvolvimento'] },
  { id: 'igeduc', name: 'IGEDUC', aliases: ['Instituto de Apoio à Gestão e Educação'] },
  { id: 'furb', name: 'FURB', aliases: ['Universidade de Blumenau'] },
  { id: 'iat', name: 'IAT', aliases: ['Instituto de Administração e Tecnologia'] },
  { id: 'idcap', name: 'IDCAP', aliases: ['Instituto de Desenvolvimento e Capacitação'] },
];

export function normalizeTaxonomyKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const boardByAlias = new Map<string, CanonicalBoard>();
for (const board of BETA_BOARD_ALIASES) {
  const canonical = { id: board.id, name: board.name };
  boardByAlias.set(normalizeTaxonomyKey(board.name), canonical);
  for (const alias of board.aliases) boardByAlias.set(normalizeTaxonomyKey(alias), canonical);
}

export function resolveBoardAlias(sourceName: string | null): {
  sourceName: string | null;
  canonical: CanonicalBoard | null;
} {
  if (!sourceName) return { sourceName: null, canonical: null };
  return { sourceName, canonical: boardByAlias.get(normalizeTaxonomyKey(sourceName)) || null };
}
