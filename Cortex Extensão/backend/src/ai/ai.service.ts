import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export type EditalExtraction = {
  summary: string;
  board: string | null;
  organization: string | null;
  examDate: string | null;
  generalEligibilityRequirements?: string[];
  jobs: Array<{ name: string; baseJob?: string | null; profileName?: string | null; requirements: string[]; taskSummary?: string | null; tasks?: string[]; vacancies: string | null; quotas: string[]; pcd: string[]; subjects: Array<{ name: string; topics: Array<{ name: string; subtopics: string[] }> }>; notes: string[] }>;
  notices: string[];
};

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
    }
  }

  async structureEdital(text: string) {
    if (!this.model) {
      throw new Error('Serviço de análise de edital não configurado');
    }

    try {
      const prompt = `Você é um especialista em análise de editais de concursos brasileiros. 
      Seu objetivo é extrair a estrutura de matérias e tópicos do texto do edital fornecido.
      Retorne APENAS um JSON estruturado seguindo EXATAMENTE este formato, sem textos explicativos:
      {
        "subjects": [
          {
            "name": "Nome da Matéria",
            "topics": [
              {
                "name": "Nome do Tópico",
                "subtopics": ["Subtópico 1", "Subtópico 2"]
              }
            ]
          }
        ]
      }
      
      Texto do edital: \n\n${text.substring(0, 30000)}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let jsonText = response.text();
      
      // Limpeza básica caso o modelo retorne markdown
      jsonText = jsonText.replace(/```json|```/g, '').trim();

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Erro na IA Gemini:', error);
      throw new Error('Não foi possível extrair uma estrutura confiável do edital');
    }
  }

  async extractEditalDetails(text: string): Promise<EditalExtraction> {
    if (!this.model) throw new Error('Serviço de análise de edital não configurado');
    const prompt = `Analise este edital brasileiro. Retorne APENAS JSON válido, sem Markdown. Não invente dados: use null ou [] quando ausente.
Formato exato:
{"summary":"resumo simples","board":null,"organization":null,"examDate":null,"generalEligibilityRequirements":[],"jobs":[{"name":"Cargo-base — Perfil: nome do perfil","baseJob":"Cargo-base","profileName":"Perfil: nome do perfil","requirements":[],"taskSummary":null,"tasks":[],"vacancies":null,"quotas":[],"pcd":[],"subjects":[{"name":"","topics":[{"name":"","subtopics":[]}]}],"notes":[]}],"notices":[]}
Regras: examDate em YYYY-MM-DD quando explícita; quotas e pcd devem registrar regras relevantes; subjects deve refletir conteúdo do cargo, incluindo conteúdo comum quando aplicável. MUITO IMPORTANTE: quando um cargo possuir perfis/especialidades (por exemplo, "Analista de TI — Perfil 1: Análise de Negócios"), retorne UMA entrada em jobs PARA CADA PERFIL. Nunca agrupe todos os perfis em um único cargo. Em cada entrada, mantenha baseJob com o cargo-base, profileName com o perfil e name com ambos. Extraia requirements, taskSummary (síntese das atribuições) e tasks (atribuições detalhadas) SOMENTE do bloco que vem imediatamente após o título daquele Cargo/Perfil. Nunca copie requisitos gerais de admissão para jobs[].requirements. Itens como aprovação/classificação, nacionalidade, idade mínima, direitos políticos, obrigações eleitorais/militares, aptidão física/mental, antecedentes criminais, acúmulo de cargos e aposentadoria são gerais: guarde-os apenas em generalEligibilityRequirements. Se um requisito do perfil tiver parte geral e específica, mantenha em requirements somente graduação, registro profissional, conselho de classe, OAB, habilitação ou experiência.
Texto do edital:\n${text.substring(0, 24000)}`;
    try {
      const result = await this.model.generateContent(prompt);
      const jsonText = (await result.response).text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(this.extractJsonObject(jsonText)) as EditalExtraction;
      if (!Array.isArray(data.jobs)) throw new Error('Cargos não encontrados na resposta');
      return this.applyProfileRequirementEvidence(data, text);
    } catch (error) {
      console.error('Erro na extração detalhada do edital:', error);
      throw new Error('Não foi possível extrair os dados do edital com segurança');
    }
  }

  private applyProfileRequirementEvidence(data: EditalExtraction, text: string): EditalExtraction {
    const evidence = this.extractProfileRequirementEvidence(text);
    if (evidence.length === 0) return data;

    return {
      ...data,
      jobs: data.jobs.map((job) => {
        const jobKey = this.normalizeForMatch(`${job.profileName || ''} ${job.name}`);
        const matched = evidence.find((item) => this.profileKeysMatch(jobKey, item.profileKey));
        if (!matched) {
          // Com evidência de perfis no PDF, é melhor não mostrar requisito genérico/incorreto.
          return { ...job, requirements: [] };
        }
        return {
          ...job,
          name: matched.fullName,
          baseJob: matched.baseJob,
          profileName: matched.profileName,
          requirements: [matched.requirement],
        };
      }),
    };
  }

  private extractProfileRequirementEvidence(text: string) {
    const header = /CARGO\s*:\s*([^\n]+?)(?=\s*(?:\r?\n|REQUISITOS\s*:))/gi;
    const matches = [...text.matchAll(header)];
    return matches.flatMap((match, index) => {
      const sectionStart = (match.index || 0) + match[0].length;
      const sectionEnd = index + 1 < matches.length ? (matches[index + 1].index || text.length) : text.length;
      const section = text.slice(sectionStart, sectionEnd);
      const requirement = section.match(/REQUISITOS\s*:\s*([\s\S]*?)(?=DESCRI.{0,50}TAREFAS|ATRIBUI[CÇ][OÕ]ES|CARGO\s*:|$)/i)?.[1]
        ?.replace(/\s+/g, ' ')
        .trim();
      const rawName = match[1].replace(/\s+/g, ' ').trim();
      const profileMatch = rawName.match(/PERFIL\s*:\s*(.+)$/i);
      if (!profileMatch || !requirement) return [];
      const baseJob = rawName.slice(0, profileMatch.index).replace(/[\-–—]\s*$/u, '').trim();
      const profileName = profileMatch[1].trim();
      return [{
        baseJob,
        profileName,
        fullName: `${baseJob} — Perfil: ${profileName}`,
        profileKey: this.normalizeForMatch(profileName.replace(/^\d+\s*[.\-–—]?\s*/u, '')),
        requirement,
      }];
    });
  }

  private normalizeForMatch(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private profileKeysMatch(left: string, right: string) {
    if (!left || !right) return false;
    if (left.includes(right) || right.includes(left)) return true;
    const stem = (token: string) => token.replace(/s$/u, '');
    const leftTokens = new Set(left.split(' ').filter((token) => token.length > 2).map(stem));
    const rightTokens = right.split(' ').filter((token) => token.length > 2).map(stem);
    const shared = rightTokens.filter((token) => leftTokens.has(token)).length;
    return shared >= Math.min(3, Math.max(2, rightTokens.length - 1));
  }

  private extractJsonObject(value: string): string {
    const start = value.indexOf('{');
    if (start < 0) throw new Error('A resposta não contém JSON');
    let depth = 0; let inString = false; let escaped = false;
    for (let index = start; index < value.length; index += 1) {
      const char = value[index];
      if (inString) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') inString = false; continue; }
      if (char === '"') { inString = true; continue; }
      if (char === '{') depth += 1;
      if (char === '}') { depth -= 1; if (depth === 0) return value.slice(start, index + 1); }
    }
    throw new Error('JSON incompleto na resposta');
  }

  async explainQuestion(input: {
    subject?: string | null;
    topic?: string | null;
    statement: string;
    alternatives: { id: string; text: string }[];
    correctAnswer: string;
    selectedOption?: string | null;
  }) {
    if (!this.model) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const head = [
      input.subject ? `Matéria: ${input.subject}` : null,
      input.topic ? `Tópico: ${input.topic}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const alternativesText = input.alternatives
      .map((a) => `${a.id}) ${a.text}`)
      .join('\n');

    const selected = input.selectedOption ? `Resposta do aluno: ${input.selectedOption}` : '';

    const prompt = [
      'Você é um professor especialista em concursos brasileiros.',
      'Explique a questão abaixo de forma didática, objetiva e em português (Brasil).',
      'Retorne em Markdown com as seções:',
      '- Resposta correta',
      '- Explicação',
      '- Por que as outras alternativas estão erradas',
      '- Dica de memorização',
      '',
      head,
      '',
      `Enunciado:\n${input.statement}`,
      '',
      `Alternativas:\n${alternativesText}`,
      '',
      `Gabarito: ${input.correctAnswer}`,
      selected ? `\n${selected}` : '',
    ]
      .filter((v) => String(v).trim().length > 0)
      .join('\n');

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }

}
