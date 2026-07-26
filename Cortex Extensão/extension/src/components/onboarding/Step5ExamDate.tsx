import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Calendar, Timer, Flag } from 'lucide-react';

const Step5ExamDate: React.FC = () => {
  const { data, updateData, nextStep } = useOnboardingStore();

  const handleQuickSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    updateData({ examDate: date.toISOString().split('T')[0] });
  };

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="text-accent" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-notion-text-h dark:text-white">Data da Prova</h2>
        <p className="text-sm text-notion-text/60 dark:text-gray-400">
          O tempo disponível define a agressividade do seu cronograma de estudos.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Timer size={16} className="text-accent" />
            Você já tem uma data definida?
          </label>
          <input
            type="date"
            value={data.examDate || ''}
            onChange={(e) => updateData({ examDate: e.target.value })}
            className="w-full bg-notion-sidebar dark:bg-white/5 border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-accent/20 transition-all text-lg font-medium"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Flag size={16} className="text-accent" />
            Ou selecione um horizonte:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '30 dias', days: 30, desc: 'Foco Total' },
              { label: '90 dias', days: 90, desc: 'Médio Prazo' },
              { label: '180 dias', days: 180, desc: 'Base Sólida' },
              { label: 'Indefinido', days: 0, desc: 'Regular' }
            ].map((plan) => (
              <button
                key={plan.label}
                onClick={() => plan.days > 0 ? handleQuickSelect(plan.days) : updateData({ examDate: undefined })}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                  // Lógica simples de seleção para o feedback visual
                  (plan.days === 0 && !data.examDate) || (data.examDate && plan.days > 0 && Math.abs((new Date(data.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) - plan.days) < 2)
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:bg-notion-hover dark:hover:bg-white/5'
                }`}
              >
                <span className="text-sm font-bold">{plan.label}</span>
                <span className="text-[10px] text-notion-text/40 uppercase font-bold">{plan.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={nextStep}
        className="mt-4 w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Configurar Minha Rotina
      </button>
    </div>
  );
};

export default Step5ExamDate;
