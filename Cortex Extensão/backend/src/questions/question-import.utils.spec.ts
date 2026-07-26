import { normalizeImportedQuestion } from './question-import.utils';

describe('normalizeImportedQuestion', () => {
  it('normaliza a questao e alinha a alternativa correta com o gabarito oficial', () => {
    const normalized = normalizeImportedQuestion({
      cortex_id_num: 123,
      cortex_id: 'C123',
      enunciado: ' Qual e a capital? ',
      alternativas: [
        { letra: 'A', texto: 'Sao Paulo', correta: false },
        { letra: 'B', texto: 'Brasilia', correta: false },
      ],
      gabarito_oficial: 'b',
      dificuldade: 'Facil',
      dificuldade_num: 2,
      tipo: 'multipla escolha',
      ano: '2024',
      prova: 'Prova X',
      banca: 'Banca Y',
      materia: 'Geografia',
      topico: 'Capitais',
      subtopico: 'Brasil',
      texto_associado: ' Texto extra ',
      imagens_enunciado: ['img1.png'],
      orgaos: [{ nome: 'Orgao' }],
    });

    expect(normalized.cortexIdNum).toBe(123);
    expect(normalized.cortexId).toBe('C123');
    expect(normalized.statement).toBe('Qual e a capital?');
    expect(normalized.officialAnswer).toBe('B');
    expect(normalized.options).toHaveLength(2);
    expect(normalized.options[1]).toMatchObject({
      letter: 'B',
      isCorrect: true,
      text: 'Brasilia',
    });
    expect(normalized.year).toBe(2024);
    expect(normalized.statementImages).toEqual(['img1.png']);
    expect(normalized.rawJson).toEqual({
      orgaos: [{ nome: 'Orgao' }],
    });
    expect(normalized.contentText).toContain('Qual e a capital?');
    expect(normalized.contentHash).toHaveLength(64);
  });

  it('falha quando a questao nao possui ids cortex validos', () => {
    expect(() =>
      normalizeImportedQuestion({
        enunciado: 'Questao sem id',
      }),
    ).toThrow('Questao sem cortex_id_num valido');
  });
});
