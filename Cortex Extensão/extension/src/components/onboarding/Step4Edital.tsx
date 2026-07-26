import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { ContestsService } from '../../services/contests.service';
import { FileUp, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Step4Edital: React.FC = () => {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Por favor, selecione apenas arquivos PDF.');
        return;
      }
      updateData({ editalFile: file, hasEdital: true });
      setError(null);
    }
  };

  const handleAnalysis = async () => {
    if (!data.editalFile) {
      nextStep();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const contestsService = ContestsService.getInstance();
      const result = await contestsService.uploadEdital(data.editalFile);
      console.log('Edital analisado:', result);
      nextStep();
    } catch (err: any) {
      console.error('Erro na análise:', err);
      setError(err.message || 'Falha ao analisar o edital. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-md mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="text-accent" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-notion-text-h dark:text-white">Edital do Concurso</h2>
        <p className="text-sm text-notion-text/60 dark:text-gray-400">
          O motor de IA analisará o edital para criar seu grafo de conhecimento automático.
        </p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            data.editalFile 
              ? 'border-accent bg-accent/5' 
              : 'border-border hover:border-accent/50 hover:bg-notion-hover dark:hover:bg-white/5'
          }`}
          onClick={() => !loading && document.getElementById('edital-input')?.click()}
        >
          <input
            id="edital-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
          
          {data.editalFile ? (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-notion-text-h dark:text-white truncate max-w-[200px] mx-auto">
                  {data.editalFile.name}
                </p>
                <p className="text-xs text-green-600 font-medium">Pronto para analisar</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  updateData({ editalFile: undefined, hasEdital: false });
                }}
                className="text-xs text-notion-text/40 hover:text-red-500 underline"
              >
                Remover arquivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent/5 rounded-full flex items-center justify-center mx-auto">
                <FileUp className="text-accent/60" size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Clique para enviar o PDF</p>
                <p className="text-xs text-notion-text/40 dark:text-gray-500">
                  Arraste ou selecione o arquivo do edital
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Mapeando Conteúdo...
              </span>
            ) : (
              data.editalFile ? 'Analisar e Continuar' : 'Continuar sem edital'
            )}
          </button>
          
          {!data.editalFile && !loading && (
            <p className="text-[10px] text-center text-notion-text/30 uppercase tracking-widest">
              Você poderá adicionar o edital depois
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Edital;
