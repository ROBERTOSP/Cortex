import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export type EditalExtraction = {
  summary: string;
  board: string | null;
  organization: string | null;
  examDate: string | null;
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
{"summary":"resumo simples","board":null,"organization":null,"examDate":null,"jobs":[{"name":"Cargo-base — Perfil: nome do perfil","baseJob":"Cargo-base","profileName":"Perfil: nome do perfil","requirements":[],"taskSummary":null,"tasks":[],"vacancies":null,"quotas":[],"pcd":[],"subjects":[{"name":"","topics":[{"name":"","subtopics":[]}]}],"notes":[]}],"notices":[]}
Regras: examDate em YYYY-MM-DD quando explícita; quotas e pcd devem registrar regras relevantes; subjects deve refletir conteúdo do cargo, incluindo conteúdo comum quando aplicável. MUITO IMPORTANTE: quando um cargo possuir perfis/especialidades (por exemplo, "Analista de TI — Perfil 1: Análise de Negócios"), retorne UMA entrada em jobs PARA CADA PERFIL. Nunca agrupe todos os perfis em um único cargo. Em cada entrada, mantenha baseJob com o cargo-base, profileName com o perfil e name com ambos. Extraia requirements, taskSummary (síntese das atribuições) e tasks (atribuições detalhadas) do perfil correto, sem misturar informações de outros perfis.
Texto do edital:\n${text.substring(0, 24000)}`;
    try {
      const result = await this.model.generateContent(prompt);
      const jsonText = (await result.response).text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(this.extractJsonObject(jsonText)) as EditalExtraction;
      if (!Array.isArray(data.jobs)) throw new Error('Cargos não encontrados na resposta');
      return data;
    } catch (error) {
      console.error('Erro na extração detalhada do edital:', error);
      throw new Error('Não foi possível extrair os dados do edital com segurança');
    }
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
