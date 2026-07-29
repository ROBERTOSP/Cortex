import { Link } from "react-router";

export function PrivacyRoutine() {
  return <main className="w-full px-6 py-10 md:px-12">
    <Link className="text-sm text-primary underline" to="/app/onboarding-v1">Voltar para a rotina</Link>
    <h1 className="mt-5 text-3xl font-semibold">Como usamos seus dados</h1>
    <p className="mt-3 text-muted-foreground">Usamos as informações da sua rotina somente para personalizar suas recomendações.</p>
    <section className="mt-8 space-y-3 text-sm leading-6"><h2 className="text-lg font-semibold">Antes da publicação</h2><p>O responsável pelo produto deve definir retenção, medidas de proteção, compartilhamentos, canal de contato e a Política de Privacidade.</p></section>
  </main>;
}
