import { ContestsService } from './contests.service';

describe('ContestsService', () => {
  const database: any = {
    contest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    knowledgeNode: {
      create: jest.fn(),
    },
    editalVersion: {
      create: jest.fn(),
    },
  };
  const ai: any = {
    structureEdital: jest.fn(),
    extractEditalDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lista o catalogo inicial de editais', () => {
    const service = new ContestsService(database, ai);
    const catalog = service.listCatalog();

    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog[0]).toHaveProperty('subjects');
  });

  it('cria concurso a partir de template do catalogo', async () => {
    database.contest.create.mockResolvedValue({ id: 'c1' });
    database.contest.findFirst.mockResolvedValue({ id: 'c1', nodes: [] });
    database.knowledgeNode.create.mockResolvedValue({ id: 'n1' });

    const service = new ContestsService(database, ai);
    await service.createForUser('u1', {
      templateId: 'pf-agente-administrativo',
      targetJob: 'Agente Administrativo',
    });

    expect(database.contest.create).toHaveBeenCalled();
    expect(ai.structureEdital).not.toHaveBeenCalled();
  });

  it('usa a IA quando o texto do edital e enviado', async () => {
    database.contest.create.mockResolvedValue({ id: 'c1' });
    database.contest.findFirst.mockResolvedValue({ id: 'c1', nodes: [] });
    database.knowledgeNode.create.mockResolvedValue({ id: 'n1' });
    ai.extractEditalDetails.mockResolvedValue({
      summary: 'Resumo', board: 'FGV', organization: null, examDate: null, notices: [],
      jobs: [{ name: 'Analista', requirements: [], vacancies: null, quotas: [], pcd: [], notes: [], subjects: [
        { name: 'Direito Constitucional', topics: [{ name: 'Direitos Fundamentais', subtopics: ['A'] }] },
      ] }],
    });

    const service = new ContestsService(database, ai);
    await service.createForUser('u1', {
      name: 'Concurso X',
      targetJob: 'Analista',
      board: 'FGV',
      editalText: 'Texto do edital',
    });

    expect(ai.extractEditalDetails).toHaveBeenCalledWith('Texto do edital');
    expect(database.contest.create).toHaveBeenCalled();
  });
});
