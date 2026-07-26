import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Zap, Moon, Sun, Coffee, Briefcase, GraduationCap } from 'lucide-react';

const Step6Routine: React.FC = () => {
  const { data, updateData, nextStep } = useOnboardingStore();

  const handleRoutineUpdate = (field: string, value: any) => {
    updateData({
      routine: {
        ...data.routine,
        [field]: value
      } as any
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-notion-text-h dark:text-white text-center">Mapeamento da Rotina</h2>
        <p className="text-sm text-notion-text/60 dark:text-gray-400 text-center">
          Como é seu dia a dia real? Isso ajuda a IA a sugerir os melhores horários.
        </p>
      </div>

      <div className="space-y-8">
        {/* Nível de Cansaço */}
        <div className="space-y-4">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Coffee size={16} className="text-accent" />
            Nível de cansaço após o trabalho/dia?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Baixo', label: 'Energizado', icon: '⚡' },
              { id: 'Médio', label: 'Ok', icon: '😐' },
              { id: 'Alto', label: 'Exausto', icon: '😴' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => updateData({ fatigueLevel: level.id as any })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  data.fatigueLevel === level.id
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:bg-notion-hover dark:hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{level.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pico de Energia */}
        <div className="space-y-4">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Zap size={16} className="text-accent" />
            Horário de maior foco (Golden Hours)?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Manhã', label: 'Manhã', icon: <Sun size={18} /> },
              { id: 'Tarde', label: 'Tarde', icon: <Sun size={18} className="text-orange-400" /> },
              { id: 'Noite', label: 'Noite', icon: <Moon size={18} /> }
            ].map((time) => (
              <button
                key={time.id}
                onClick={() => handleRoutineUpdate('peakEnergyTime', time.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  data.routine?.peakEnergyTime === time.id
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:bg-notion-hover dark:hover:bg-white/5'
                }`}
              >
                <div className={data.routine?.peakEnergyTime === time.id ? 'text-accent' : 'text-notion-text/40'}>
                  {time.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ocupação */}
        <div className="p-4 rounded-2xl bg-notion-sidebar dark:bg-white/5 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-accent" />
              <span className="text-sm font-medium">Você trabalha?</span>
            </div>
            <button
              onClick={() => handleRoutineUpdate('works', !data.routine?.works)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                data.routine?.works ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`${
                  data.routine?.works ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-accent" />
              <span className="text-sm font-medium">Estuda em tempo integral?</span>
            </div>
            <button
              onClick={() => handleRoutineUpdate('fullTimeStudent', !data.routine?.fullTimeStudent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                data.routine?.fullTimeStudent ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`${
                  data.routine?.fullTimeStudent ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={nextStep}
        className="mt-4 w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Gerar Meu Digital Twin
      </button>
    </div>
  );
};

export default Step6Routine;
