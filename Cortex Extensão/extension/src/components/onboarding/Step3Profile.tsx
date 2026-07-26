import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { User, Clock, Target, Briefcase } from 'lucide-react';

const Step3Profile: React.FC = () => {
  const { data, updateData, nextStep } = useOnboardingStore();

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-notion-text-h dark:text-white">Perfil de Aprendizado</h2>
        <p className="text-sm text-notion-text/60 dark:text-gray-400">
          Personalize seu assistente para sua rotina atual.
        </p>
      </div>

      <div className="space-y-6">
        {/* Nível de Estudo */}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <User size={16} className="text-accent" />
            Nível atual de estudo?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Ativo', label: 'Estudando Ativamente' },
              { id: 'Inativo', label: 'Retornando Agora' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => updateData({ studyLevel: level.id as any })}
                className={`p-4 rounded-xl border text-sm text-left transition-all ${
                  data.studyLevel === level.id
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:bg-notion-hover dark:hover:bg-white/5'
                }`}
              >
                <span className="block font-medium">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Horas Diárias */}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Clock size={16} className="text-accent" />
            Tempo diário disponível?
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="18"
              value={data.dailyStudyHours || ''}
              onChange={(e) => updateData({ dailyStudyHours: Number(e.target.value) })}
              placeholder="Ex: 4"
              className="w-full bg-notion-sidebar dark:bg-white/5 border border-border rounded-xl p-4 pl-4 outline-none focus:ring-2 focus:ring-accent/20 transition-all text-lg font-medium"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-notion-text/40">horas / dia</span>
          </div>
        </div>

        {/* Objetivo */}
        <div className="space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Target size={16} className="text-accent" />
            Qual seu objetivo final?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {['Concurso', 'OAB', 'Especialização'].map((obj) => (
              <button
                key={obj}
                onClick={() => updateData({ objective: obj })}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  data.objective === obj
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:bg-notion-hover dark:hover:bg-white/5'
                }`}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>

        {/* Cargo (Condicional) */}
        {data.objective === 'Concurso' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Briefcase size={16} className="text-accent" />
              Qual cargo pretende ocupar?
            </label>
            <input
              type="text"
              value={data.targetJob || ''}
              onChange={(e) => updateData({ targetJob: e.target.value })}
              placeholder="Ex: Auditor Fiscal, Policial Federal..."
              className="w-full bg-notion-sidebar dark:bg-white/5 border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          disabled={!data.studyLevel || !data.dailyStudyHours || !data.objective}
          onClick={nextStep}
          className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          Continuar para o Edital
        </button>
      </div>
    </div>
  );
};

export default Step3Profile;
