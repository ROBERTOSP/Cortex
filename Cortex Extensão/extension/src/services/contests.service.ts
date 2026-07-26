import { API_URL } from '../config';
import type { User } from '../types';

export class ContestsService {
  private static instance: ContestsService;

  private constructor() {}

  public static getInstance(): ContestsService {
    if (!ContestsService.instance) {
      ContestsService.instance = new ContestsService();
    }
    return ContestsService.instance;
  }

  async uploadEdital(file: File): Promise<any> {
    const authData = await chrome.storage.local.get(['auth_token', 'user']) as { auth_token?: string, user?: User };
    if (!authData.user) {
      throw new Error('Usuário não autenticado');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', authData.user.id);

    const response = await fetch(`${API_URL}/contests/upload-edital`, {
      method: 'POST',
      body: formData,
      // Nota: Não enviamos Content-Type para FormData, o browser cuida disso
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao processar edital');
    }

    return response.json();
  }
}
