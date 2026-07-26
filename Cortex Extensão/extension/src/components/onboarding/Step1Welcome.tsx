import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

const Step1Welcome: React.FC = () => {
  const nextStep = useOnboardingStore((state) => state.nextStep);

  return (
    <div className="flex flex-col gap-10 max-w-md mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-[2.5rem] mb-2 animate-bounce-slow">
          <Brain className="text-accent" size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-notion-text-h dark:text-white italic">
            Cortex<span className="text-accent not-italic">.</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-accent font-bold text-xs uppercase tracking-[0.3em]">
            <Sparkles size={12} />
            Seu Digital Twin de Estudos
          </div>
        </div>

        <div className="space-y-4 px-4">
          <p className="text-base leading-relaxed text-notion-text/80 dark:text-gray-300 font-medium">
            Descubra seu método ideal de aprendizado através de IA e neurociência aplicada.
          </p>
          <p className="text-xs leading-relaxed text-notion-text/40 dark:text-gray-500 italic border-t border-border pt-4">
            "O cérebro aprende de formas diferentes dependendo do contexto biológico, cognitivo e ambiental."
          </p>
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={nextStep}
          className="group w-full bg-accent text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-accent/30 hover:shadow-accent/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
        >
          Iniciar Configuração
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[10px] text-center mt-4 text-notion-text/30 font-bold uppercase tracking-widest">
          Leva menos de 2 minutos
        </p>
      </div>
    </div>
  );
};

export default Step1Welcome;
