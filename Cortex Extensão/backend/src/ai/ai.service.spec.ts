import { AiService } from './ai.service';

describe('AiService', () => {
  it('não inventa uma estrutura de edital quando o serviço de IA não está configurado', async () => {
    const previous = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const service = new AiService();
      await expect(service.structureEdital('conteúdo de edital')).rejects.toThrow(
        'Serviço de análise de edital não configurado',
      );
    } finally {
      if (previous === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = previous;
    }
  });
});
