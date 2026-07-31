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
    sharedEdital: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const ai: any = {
    structureEdital: jest.fn(),
    extractEditalDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    database.sharedEdital.findFirst.mockResolvedValue(null);
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
    database.sharedEdital.findFirst.mockResolvedValue({
      id: 'pf-agente-administrativo',
      title: 'Polícia Federal',
      board: 'Cebraspe',
      examDate: new Date('2026-11-15'),
      status: 'PUBLISHED',
      extraction: {
        jobs: [
          {
            name: 'Agente Administrativo',
            requirements: ['Ensino médio'],
            subjects: [
              {
                name: 'Língua Portuguesa',
                topics: [{ name: 'Interpretação', subtopics: [] }],
              },
            ],
          },
        ],
      },
    });

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

  describe('revisao administrativa de edital', () => {
    const validExtraction = {
      summary: 'Resumo revisado',
      board: 'FGV',
      examDate: '2026-11-15',
      notices: [],
      generalEligibilityRequirements: [],
      jobs: [
        {
          name: 'Analista',
          requirements: ['Graduação em nível superior'],
          vacancies: '10 vagas',
          quotas: [],
          pcd: [],
          notes: [],
          subjects: [
            {
              name: 'Língua Portuguesa',
              topics: [
                {
                  name: 'Interpretação de textos',
                  subtopics: ['Inferência'],
                },
              ],
            },
          ],
        },
      ],
    };

    it('persiste a estrutura editorial revisada', async () => {
      database.sharedEdital.findUnique.mockResolvedValue({
        id: 'e1',
        status: 'REVIEW',
        extraction: validExtraction,
      });
      database.sharedEdital.update.mockResolvedValue({ id: 'e1' });

      const service = new ContestsService(database, ai);
      await service.updateAdminEdital('e1', { extraction: validExtraction });

      expect(database.sharedEdital.update).toHaveBeenCalledWith({
        where: { id: 'e1' },
        data: { extraction: validExtraction },
      });
    });

    it('rejeita estrutura editorial com campos de tipos invalidos', async () => {
      database.sharedEdital.findUnique.mockResolvedValue({
        id: 'e1',
        status: 'REVIEW',
        extraction: validExtraction,
      });

      const service = new ContestsService(database, ai);

      await expect(
        service.updateAdminEdital('e1', {
          extraction: {
            ...validExtraction,
            jobs: [{ name: 'Analista', requirements: 'texto solto' }],
          },
        }),
      ).rejects.toThrow('Estrutura do edital inválida');
      expect(database.sharedEdital.update).not.toHaveBeenCalled();
    });

    it('bloqueia publicacao quando cargo nao possui requisito', async () => {
      database.sharedEdital.findUnique.mockResolvedValue({
        id: 'e1',
        status: 'REVIEW',
        extraction: {
          ...validExtraction,
          jobs: [{ ...validExtraction.jobs[0], requirements: [] }],
        },
      });

      const service = new ContestsService(database, ai);

      await expect(service.setAdminEditalStatus('e1', 'PUBLISHED')).rejects.toThrow(
        'Requisitos não revisados',
      );
      expect(database.sharedEdital.update).not.toHaveBeenCalled();
    });

    it('bloqueia publicacao quando materia nao possui topico', async () => {
      database.sharedEdital.findUnique.mockResolvedValue({
        id: 'e1',
        status: 'REVIEW',
        extraction: {
          ...validExtraction,
          jobs: [
            {
              ...validExtraction.jobs[0],
              subjects: [{ name: 'Língua Portuguesa', topics: [] }],
            },
          ],
        },
      });

      const service = new ContestsService(database, ai);

      await expect(service.setAdminEditalStatus('e1', 'PUBLISHED')).rejects.toThrow(
        'Conteúdo programático incompleto',
      );
      expect(database.sharedEdital.update).not.toHaveBeenCalled();
    });

    it('publica edital integralmente revisado', async () => {
      database.sharedEdital.findUnique.mockResolvedValue({
        id: 'e1',
        status: 'REVIEW',
        extraction: validExtraction,
      });
      database.sharedEdital.update.mockResolvedValue({
        id: 'e1',
        status: 'PUBLISHED',
      });

      const service = new ContestsService(database, ai);
      await service.setAdminEditalStatus('e1', 'PUBLISHED');

      expect(database.sharedEdital.update).toHaveBeenCalledWith({
        where: { id: 'e1' },
        data: { status: 'PUBLISHED' },
      });
    });
  });
});
