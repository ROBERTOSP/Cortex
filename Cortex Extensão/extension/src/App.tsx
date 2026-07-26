import { useEffect, useState } from 'react'
import './App.css'
import OnboardingContainer from './components/onboarding/OnboardingContainer'
import { useOnboardingStore } from './store/useOnboardingStore'
import { AuthService } from './services/auth.service'

function App() {
  const { setStep, step, _hasHydrated } = useOnboardingStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    // Só inicia a verificação de sessão após o Zustand carregar os dados do storage
    if (!_hasHydrated) return;

    const initSession = async () => {
      try {
        console.log('Verificando sessão persistente...')
        const authService = AuthService.getInstance()
        const isAuth = await authService.isAuthenticated()
        
        if (isAuth) {
          console.log('Sessão ativa encontrada. Passo atual:', step)
          // Se estiver na tela de login/boas-vindas mas já tiver sessão, pula para o perfil
          if (step <= 2) {
            console.log('Redirecionando para o perfil (Step 3)')
            setStep(3)
          }
        } else {
          console.log('Nenhuma sessão ativa encontrada.')
        }
      } catch (err) {
        console.error('Erro ao recuperar sessão:', err)
      } finally {
        // Pequeno delay para evitar flickers na UI
        setTimeout(() => setInitializing(false), 300)
      }
    }

    initSession()
  }, [_hasHydrated])

  if (initializing || !_hasHydrated) {
    return (
      <div className="bg-notion-bgLight dark:bg-notion-bgDark min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-accent font-bold tracking-widest uppercase text-xs">
          Cortex Inicializando...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-notion-bgLight dark:bg-notion-bgDark min-h-screen text-notion-light dark:text-notion-dark font-sans">
      <OnboardingContainer />
    </div>
  )
}

export default App
