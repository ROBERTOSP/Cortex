import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, API_URL } from '../config';
import type { AuthResponse } from '../types';

export class AuthService {
  private static instance: AuthService;
  private supabase: SupabaseClient;

  private constructor() {
    console.log('Inicializando Supabase Client com Custom Storage...');
    
    // Custom storage para extensões Chrome usando chrome.storage.local
    const customStorage = {
      getItem: (key: string) => {
        return new Promise<string | null>((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve((result[key] as string) || null);
          });
        });
      },
      setItem: (key: string, value: string) => {
        return new Promise<void>((resolve) => {
          chrome.storage.local.set({ [key]: value }, () => {
            resolve();
          });
        });
      },
      removeItem: (key: string) => {
        return new Promise<void>((resolve) => {
          chrome.storage.local.remove([key], () => {
            resolve();
          });
        });
      },
    };

    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storage: customStorage as any
      }
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Realiza o login via Google usando o fluxo launchWebAuthFlow do Chrome
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const redirectUrl = chrome.identity.getRedirectURL();
      console.log('Iniciando login Google. Redirect URL:', redirectUrl);

      // 1. Solicita a URL de login ao Supabase
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        console.error('Erro no signInWithOAuth:', error);
        throw error;
      }
      
      if (!data?.url) {
        throw new Error('Supabase não retornou URL de login');
      }

      console.log('URL de login obtida:', data.url);

      // 2. Abre a janela de login do Chrome
      return new Promise((resolve, reject) => {
        console.log('Abrindo launchWebAuthFlow...');
        chrome.identity.launchWebAuthFlow({
          url: data.url,
          interactive: true
        }, async (responseUrl) => {
          if (chrome.runtime.lastError) {
            console.error('Erro no launchWebAuthFlow:', chrome.runtime.lastError);
            return reject(new Error(chrome.runtime.lastError.message));
          }

          if (!responseUrl) {
            console.warn('Nenhuma responseUrl retornada (usuário pode ter fechado a janela)');
            return reject(new Error('Login cancelado ou janela fechada'));
          }

          console.log('Login Google concluído! Resposta recebida:', responseUrl);

          try {
            // No modo PKCE, a URL vem com ?code=...
            const url = new URL(responseUrl);
            const code = url.searchParams.get('code');

            if (!code) {
              // Tenta verificar se veio no fragmento # por segurança
              const hashUrl = new URL(responseUrl.replace('#', '?'));
              const accessToken = hashUrl.searchParams.get('access_token');
              
              if (accessToken) {
                console.log('Token de acesso encontrado no fragmento #. Usando fluxo implícito...');
                return this.handleAccessTokenFlow(accessToken, hashUrl.searchParams.get('refresh_token'), resolve, reject);
              }
              console.error('Nenhum código ou token encontrado na URL de resposta:', responseUrl);
              throw new Error('ERRO_CORTEX_TOKEN_NAO_ENCONTRADO_NA_URL');
            }

            console.log('Código PKCE extraído. Trocando por sessão...');

            // 3. Troca o código pela sessão
            const { data: sessionData, error: sessionError } = await this.supabase.auth.exchangeCodeForSession(code);

            if (sessionError) {
              console.error('Erro ao trocar código por sessão:', sessionError);
              throw sessionError;
            }

            this.finalizeLogin(sessionData, resolve, reject);

          } catch (err) {
            console.error('Erro ao processar tokens de retorno:', err);
            reject(err);
          }
        });
      });
    } catch (err: any) {
      console.error('Erro geral no loginWithGoogle:', err);
      throw err;
    }
  }

  private async handleAccessTokenFlow(accessToken: string, refreshToken: string | null, resolve: any, reject: any) {
    const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });
    if (sessionError) return reject(sessionError);
    this.finalizeLogin(sessionData, resolve, reject);
  }

  private async finalizeLogin(sessionData: any, resolve: any, reject: any) {
    try {
      const user = sessionData.user;
      if (!user) throw new Error('Usuário não retornado pelo Supabase');

      const authData: AuthResponse = {
        token: sessionData.session?.access_token || '',
        user: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name,
          avatarUrl: user.user_metadata.avatar_url,
          tokens: user.user_metadata.tokens || 100
        }
      };

      // Salva no storage local
      await chrome.storage.local.set({ 
        'auth_token': authData.token,
        'user': authData.user 
      });

      console.log('Sessão salva localmente. Sincronizando com backend...');
      await this.syncWithBackend(authData.token);

      resolve(authData);
    } catch (err) {
      reject(err);
    }
  }

  private async syncWithBackend(token: string) {
    try {
      console.log('Sincronizando com backend... Token (primeiros 10 chars):', token.substring(0, 10));
      const response = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ERRO_SYNC_BACKEND: ${response.status} - ${errorText}`);
      } else {
        console.log('Sincronização com backend concluída com sucesso!');
      }
    } catch (e) {
      console.error('Erro de rede ao sincronizar com backend:', e);
    }
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    await chrome.storage.local.remove(['auth_token', 'user']);
  }

  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.supabase.auth.getSession();
    return !!data.session;
  }

  async getStoredUser(): Promise<any> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}
