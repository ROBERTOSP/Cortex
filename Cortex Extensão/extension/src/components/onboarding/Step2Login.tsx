import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { AuthService } from '../../services/auth.service';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';

const Step2Login: React.FC = () => {
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const setUser = useOnboardingStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const authService = AuthService.getInstance();
      const authData = await authService.loginWithGoogle();
      console.log('Login realizado com sucesso!', authData);
      
      // Salva o usuário no store global
      setUser(authData.user);
      
      nextStep();
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Falha ao conectar com o Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-md mx-auto py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LogIn className="text-accent" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-notion-text-h dark:text-white">
          Sua Conta
        </h2>
        <p className="text-sm text-notion-text/60 dark:text-gray-400 px-8">
          Sincronize seu progresso, anotações e IA em todos os seus dispositivos.
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}
        
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-border py-4 rounded-xl font-bold text-notion-text-h dark:text-white hover:bg-notion-hover dark:hover:bg-white/10 shadow-sm transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Conectando...
            </span>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Entrar com Google
            </>
          )}
        </button>
        
        <button
          onClick={nextStep}
          disabled={loading}
          className="text-xs font-semibold text-notion-text/40 dark:text-gray-500 hover:text-accent transition-colors disabled:no-underline"
        >
          Pular por enquanto (Modo Offline)
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-notion-text/20 uppercase tracking-widest mt-8">
        <ShieldCheck size={12} />
        Sua privacidade é nossa prioridade
      </div>
    </div>
  );
};

export default Step2Login;
