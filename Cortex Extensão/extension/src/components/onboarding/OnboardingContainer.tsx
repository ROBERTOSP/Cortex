import React from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import Step1Welcome from './Step1Welcome';
import Step2Login from './Step2Login';
import Step3Profile from './Step3Profile';
import Step4Edital from './Step4Edital';
import Step5ExamDate from './Step5ExamDate';
import Step6Routine from './Step6Routine';
import Step7InitialPlan from './Step7InitialPlan';

const OnboardingContainer: React.FC = () => {
  const step = useOnboardingStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Welcome />;
      case 2: return <Step2Login />;
      case 3: return <Step3Profile />;
      case 4: return <Step4Edital />;
      case 5: return <Step5ExamDate />;
      case 6: return <Step6Routine />;
      case 7: return <Step7InitialPlan />;
      default: return <Step1Welcome />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-8 bg-notion-bg dark:bg-bg transition-colors duration-500">
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        {renderStep()}
      </div>
      
      {step > 1 && step < 7 && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-10 rounded-full transition-all duration-500 ${
                  i <= step 
                    ? 'bg-accent shadow-[0_0_8px_rgba(35,131,226,0.4)]' 
                    : 'bg-border dark:bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-notion-text/20 uppercase tracking-[0.2em]">
            Passo {step} de 6
          </span>
        </div>
      )}
    </div>
  );
};

export default OnboardingContainer;
