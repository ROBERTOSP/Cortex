import React, { useEffect, useState } from 'react';
import { Sparkles, BarChart3, ListChecks, ArrowRight } from 'lucide-react';

const Step7InitialPlan: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Analisando seu perfil cognitivo...",
    "Mapeando edital e disciplinas...",
    "Calculando prioridades de estudo...",
    "Finalizando seu Digital Twin..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    const finishTimer = setTimeout(() => setLoading(false), 6000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-20 text-center animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-accent/10 border-t-accent animate-spin rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-accent animate-pulse" size={24} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-notion-text-h dark:text-white">
            {loadingMessages[loadingStep]}
          </p>
          <div className="flex gap-1 justify-center">
            {loadingMessages.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 w-4 rounded-full transition-all duration-500 ${i <= loadingStep ? 'bg-accent' : 'bg-border'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto py-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-green-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-notion-text-h dark:text-white">Seu Plano de Aprovação</h2>
        <p className="text-sm text-notion-text/60 dark:text-gray-400">
          Tudo pronto! Seu mapa de calor e cronograma foram gerados com sucesso.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl border border-border bg-notion-sidebar dark:bg-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <ListChecks className="text-accent" size={20} />
            <h3 className="text-sm font-bold text-notion-text-h dark:text-white uppercase tracking-wider">Resumo Estratégico</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-notion-text/40 uppercase">Disciplinas</span>
              <p className="text-lg font-black">12</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-notion-text/40 uppercase">Tópicos</span>
              <p className="text-lg font-black">142</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <span className="text-[10px] font-bold text-notion-text/40 uppercase block mb-1">Prioridade Inicial</span>
            <p className="text-sm font-bold text-accent">Direito Constitucional & Administrativo</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-accent/20 bg-accent/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Meta Semanal</span>
            <p className="text-2xl font-black text-notion-text-h dark:text-white">24 horas</p>
          </div>
          <BarChart3 className="text-accent/40" size={32} />
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="group mt-4 w-full bg-accent text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-accent/30 hover:shadow-accent/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
      >
        Acessar Meu Workspace
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default Step7InitialPlan;
