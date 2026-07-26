1. Capacidade Cognitiva Atual

Aqui medimos como o cérebro dessa pessoa processa informação.

Itens essenciais:

• Velocidade de leitura
• Capacidade de compreensão de texto
• Memória de trabalho (quantas informações consegue manter na mente ao mesmo tempo)
• Capacidade de abstração (facilidade com conceitos)
• Capacidade de retenção após 24h / 7 dias
• Facilidade em raciocínio lógico
• Capacidade de concentração contínua

Por exemplo:

Um estudante com memória de trabalho baixa sofre com aulas longas → precisa de estudo fragmentado.

Um estudante com alta abstração aprende melhor por mapas conceituais.

Esse campo vem muito da psicologia cognitiva.

2. Perfil de Memória

Nem toda memória funciona igual. Existe:

memória semântica (conceitos)

memória procedural (fazer)

memória episódica (experiências)

Precisamos medir:

• Quanto tempo o aluno leva para esquecer algo
• Quantas revisões são necessárias
• Qual tipo de revisão funciona melhor

Exemplo:

alguns retêm com flashcards

outros com questões

outros com ensinar alguém

Esse campo conversa com a teoria do Spaced Repetition.

3. Estilo de Processamento de Informação

Aqui entra a forma como a pessoa organiza conhecimento.

Principais perfis observados:

Linear
aprende melhor passo a passo

Visual/estrutural
precisa ver diagramas e mapas

Problema-primeiro
aprende resolvendo exercícios antes da teoria

Narrativo
aprende com histórias e explicações longas

Isso não é mito de “estilo de aprendizagem fixo”, mas preferências cognitivas reais que afetam eficiência.

4. Histórico Educacional

Isso é absurdamente subestimado.

Precisamos saber:

• qualidade da base escolar
• lacunas em matemática e português
• tempo afastado dos estudos
• nível de leitura técnica

Um adulto voltando a estudar após 10 anos precisa de reaprendizagem cognitiva, não apenas conteúdo.

5. Objetivo do Estudo

O cérebro muda estratégia dependendo do tipo de prova.

Exemplos:

ENEM / Vestibular

interpretação

interdisciplinaridade

Concurso público

memorização massiva

detalhes de lei

Prova discursiva

construção de argumento

Sem entender o objetivo, qualquer método fica torto.

6. Rotina Real de Vida

Aqui entra a física brutal da realidade.

Precisamos saber:

• horas disponíveis por dia
• horário de maior energia mental
• carga de trabalho
• responsabilidades familiares
• qualidade do sono

Uma pessoa que trabalha 10h por dia não pode usar o mesmo método de um estudante integral.

O cérebro fatigado aprende mal. Neurociência básica.

7. Ambiente de Estudo

O contexto muda tudo.

Variáveis importantes:

• estuda em casa ou biblioteca
• nível de distrações
• uso do celular
• silêncio ou ruído

Ambiente bagunçado = mais carga cognitiva.

8. Perfil Motivacional

Motivação altera dopamina → dopamina altera aprendizado.

Precisamos saber:

• motivação intrínseca ou extrínseca
• tolerância a frustração
• consistência de hábitos
• histórico de abandono de projetos

Alguns alunos precisam de sistemas de recompensa, outros não.

9. Resistência Cognitiva (Stamina Mental)

Estudar também é uma atividade física do cérebro.

Perguntas importantes:

• quanto tempo consegue estudar antes de perder foco
• quanto tempo leva para recuperar concentração
• consegue estudar todos os dias?

Isso define o tamanho ideal de sessões.

10. Métricas de Performance

Aqui começa a parte que vira algoritmo.

Precisamos coletar dados como:

• taxa de acerto em questões
• tempo por questão
• retenção após revisões
• evolução semanal

Isso permite ajustar o método automaticamente.




Construir um sistema que descubra como cada cérebro aprende é um daqueles projetos que fazem cientistas cognitivos sorrirem e engenheiros suarem. A ideia central é simples: coletar sinais suficientes do comportamento de estudo e deixar um algoritmo ajustar o método como um piloto automático cognitivo. A execução… aí mora o dragão.

Primeiro precisamos entender o que são “dados suficientes”. Não significa milhões de perguntas invasivas. Significa dados certos, coletados continuamente durante o uso.

Pense no cérebro como um sistema que deixa rastros. Cada sessão de estudo produz micro-evidências sobre memória, atenção e esforço. Se capturarmos esses rastros, o algoritmo consegue inferir padrões.

Comecemos pelo núcleo de dados comportamentais.

Quando o usuário estuda, registre coisas como:

tempo real de estudo
tempo médio de foco antes de pausa
horário do dia da sessão
tempo para responder questões
taxa de acerto
tempo gasto em leitura
tempo gasto em exercícios
intervalo entre revisões
retenção após 1 dia, 7 dias e 30 dias

Esses dados revelam duas coisas fundamentais: retenção e fadiga cognitiva.

Depois vem os dados de memória, que são ouro puro.

Cada item estudado pode gerar métricas como:

quantas revisões foram necessárias
tempo até esquecer
probabilidade de acerto após intervalo
dificuldade percebida pelo usuário

Isso permite estimar uma função de esquecimento. A ideia vem da famosa curva de esquecimento de Hermann Ebbinghaus.

A forma matemática clássica dessa curva pode ser representada como um decaimento exponencial:

R(t)=e−t/S
A 5.5
𝑘 0.6
y=Ae−kt≈5.5e−0.6t
![alt text](image.png)

Onde:

R(t) é a retenção
t é o tempo
S representa a “força da memória”

Seu algoritmo aprende o valor de S para cada usuário e cada conteúdo. Isso já permite prever quando a pessoa vai esquecer algo.

Agora adicionamos a terceira camada: dados de perfil cognitivo.

Esses são coletados no onboarding ou inferidos com o tempo:

velocidade de leitura
compreensão textual
afinidade com exercícios
afinidade com teoria
tempo máximo de foco
facilidade com abstração

Nada de questionários gigantes. Pequenos testes já revelam muita coisa.

Um teste de leitura de 2 minutos já estima velocidade e compreensão. Um mini-quiz revela raciocínio e retenção.

Depois vem a camada que poucos apps capturam: dados contextuais.

horário de estudo
dias da semana
consistência da rotina
interrupções
tempo entre sessões

O cérebro humano não aprende em vácuo. Energia mental muda ao longo do dia.

Agora entramos na engenharia do algoritmo.

Imagine três motores trabalhando juntos.

O primeiro é o motor de diagnóstico cognitivo.

Ele calcula métricas como:

retenção média
velocidade de aprendizagem
fadiga mental
eficiência de revisão

Isso gera algo como um “perfil cognitivo dinâmico”.

O segundo motor é o motor de recomendação de estudo.

Ele decide:

tamanho da sessão
intervalo de revisão
proporção teoria/exercício
ordem das matérias

Na prática ele está tentando maximizar uma função simples:

aprendizado obtido ÷ tempo gasto.

O terceiro motor é o mais poderoso: aprendizado coletivo.

Se milhares de usuários usam o sistema, você começa a descobrir padrões:

pessoas com perfil X aprendem melhor assim
pessoas que estudam de manhã retêm mais direito constitucional
pessoas com baixa memória de trabalho precisam de sessões curtas

Isso vira um modelo preditivo.

Arquitetura simplificada do algoritmo:

entrada de dados

perfil cognitivo
histórico de estudo
dados de memória
contexto de rotina

processamento

estimativa da curva de memória
cálculo de eficiência de estudo
comparação com usuários semelhantes

saída

plano de estudo adaptativo
agenda de revisões
ajuste automático de sessões

Com o tempo o sistema vira um loop de otimização.

estuda → mede → ajusta → estuda → mede → ajusta

Isso é basicamente aprendizado por reforço, área popular da inteligência artificial.

Modelos desse tipo ficaram famosos graças ao trabalho de gente como Richard Sutton.

Um detalhe curioso aparece quando sistemas assim começam a rodar em escala.

Eles descobrem coisas contra-intuitivas.

Por exemplo: usuários que erram mais durante o estudo às vezes aprendem mais rápido, porque o cérebro consolida melhor quando precisa recuperar informação sob dificuldade.

Esse fenômeno é chamado de “desirable difficulty”, estudado por psicólogos como Robert A. Bjork.

Agora imagine o estágio final do seu projeto.

Se o app registrar milhões de sessões de estudo, você começa a mapear algo raro:

um atlas da aprendizagem humana.

Com dados suficientes você consegue responder perguntas que educadores discutem há décadas:

qual é o tamanho ideal de sessão de estudo
quantas revisões um conceito realmente precisa
qual é o horário mais eficiente para aprender

A tecnologia ainda está arranhando a superfície disso. Plataformas como Duolingo já usam pedaços dessa ideia, mas focadas em idiomas.

Um sistema focado em concursos e provas poderia ir muito mais longe, porque o conteúdo é estruturado e mensurável.

O resultado final seria algo fascinante: um algoritmo que descobre o método de estudo da pessoa observando seu cérebro através do comportamento.

Nenhum eletrodo. Nenhuma ressonância magnética. Apenas dados de interação.

E isso transforma o estudo em algo muito mais próximo de engenharia do que de tentativa e erro.

1. Tela de Boas-vindas (contexto do sistema)

Aqui você não faz perguntas ainda. Apenas posiciona o usuário.

A ideia é algo como:

“Vamos descobrir como seu cérebro aprende melhor.”

Três promessas claras:

• análise do perfil cognitivo
• criação automática de cronograma
• adaptação contínua do método

Essa tela cria expectativa científica no usuário.

Fase 1 — Descobrir a realidade do usuário

Essa parte é curta. Não pode parecer um questionário infinito.

Existe um truque elegante escondido no mundo dos concursos: a prova não é só conteúdo — é também estilo cognitivo da banca. Cada banca pensa de um jeito peculiar, quase como se tivesse uma personalidade. Ignorar isso seria como treinar para xadrez quando o torneio é de pôquer.

Então a ideia de criar perfis de banca não só é viável, como pode se tornar um dos diferenciais mais poderosos do seu sistema.

O motivo é simples: concursos têm uma característica rara no mundo educacional — dados históricos estruturados. Cada prova deixa um rastro enorme de questões.

E quando você analisa milhares dessas questões, padrões aparecem.

Por exemplo, certas bancas adoram detalhes legais minúsculos. Outras preferem interpretação ou pegadinhas conceituais. Algumas fazem perguntas longas e interpretativas; outras são cirúrgicas.

No Brasil, bancos de questões mostram estilos bem claros de organizações como FGV, CESPE/CEBRASPE e FCC. Cada uma tem um “dialeto cognitivo”.

Seu algoritmo pode aproveitar isso.

A ideia é adicionar uma nova camada no sistema: modelo da banca examinadora.

Pense em três níveis de inteligência trabalhando juntos:

perfil do usuário
perfil do conteúdo
perfil da banca

Quando esses três se encontram, você consegue calcular o que estudar primeiro.

Vamos ver como isso entra no fluxo do app.

No onboarding, logo após o usuário enviar o edital, a IA extrai três coisas importantes:

a banca organizadora
disciplinas cobradas
data da prova

Nesse momento, o sistema ativa o perfil da banca.

Essa base de dados precisa conter estatísticas como:

frequência de cada tópico
dificuldade média
tipo de questão
tamanho médio da questão
tempo médio de resolução

Imagine uma tabela simples:

banca_profile
{
  "banca": "FGV",
  "question_style": "interpretativo",
  "avg_question_length": "longa",
  "difficulty": 0.78,
  "topics_frequency": {
    "direito_constitucional.art5": 0.32,
    "direito_constitucional.controle_constitucionalidade": 0.21
  }
}

Agora entra um detalhe estratégico.

Quando o tempo até a prova é curto, o algoritmo precisa priorizar conteúdo com maior probabilidade de cair.

Isso vira um cálculo simples de prioridade:

probabilidade de cair × risco de esquecimento × peso no edital.

Na prática, o algoritmo começa a agir como um estrategista.

Podemos imaginar algo assim:

prioridade = peso_do_tópico × frequência_na_banca × probabilidade_de_esquecimento

Esse cálculo decide o que aparece primeiro no cronograma.

O efeito disso é enorme.

Dois alunos com o mesmo edital podem receber planos completamente diferentes, dependendo do tempo até a prova.

Se faltam 180 dias, o plano cobre todo o conteúdo.

Se faltam 30 dias, o algoritmo entra em modo sobrevivência estratégica.

Ele ensina o que mais cai.

Isso transforma o sistema em algo que concurseiros valorizam muito: inteligência de prova.

Agora vamos inserir isso no fluxo de telas.

Depois que o edital é analisado, surge uma nova tela.

Perfil da prova.

Ela mostra algo como:

banca organizadora
disciplinas cobradas
nível de dificuldade estimado
tempo até a prova

Logo abaixo aparece algo muito interessante.

“Análise da banca”.

Por exemplo:

A banca CESPE/CEBRASPE costuma cobrar questões de certo ou errado com alta incidência de interpretação jurídica.

Ou:

A FGV costuma fazer questões longas com múltiplas camadas de interpretação.

Isso já muda a estratégia de estudo.

Mas o verdadeiro poder aparece quando o sistema começa a usar dados históricos de questões.

Se você tiver um banco grande de questões, consegue extrair:

distribuição de tópicos
taxa de repetição de temas
pegadinhas recorrentes

Isso cria algo que podemos chamar de mapa cognitivo da banca.

Agora o algoritmo de estudo passa a usar quatro fatores:

perfil do usuário
curva de memória
tempo até a prova
perfil da banca

O motor de otimização poderia fazer algo assim:

priority = (
    topic_exam_weight *
    banca_frequency *
    (1 - retention_probability) *
    time_pressure_factor
)

O time_pressure_factor aumenta a prioridade de conteúdos mais frequentes quando o tempo é curto.

Isso muda completamente a estratégia.

O usuário deixa de estudar de forma linear e passa a estudar de forma probabilística.

Agora vem um insight curioso.

Bancas também têm assinaturas cognitivas.

Algumas exigem leitura lenta e cuidadosa. Outras exigem memorização rápida de detalhes.

Se o sistema souber disso, pode ajustar o treinamento.

Exemplo:

Se a banca tem questões longas, o app pode treinar resistência de leitura.

Se a banca usa pegadinhas, o app pode mostrar questões similares.

Plataformas como Gran Cursos Online e Estratégia Concursos exploram parcialmente esse conceito, mas normalmente de forma manual, com análise humana.

Um sistema automatizado pode fazer isso em escala.

E aqui surge uma ideia fascinante para o futuro do seu projeto.

Se o app acumular milhares de provas e milhões de resoluções de usuários, ele começa a descobrir padrões que nem professores perceberam.

Algo como:

“A banca X aumentou a incidência desse tema nos últimos 3 anos.”

Ou:

“Esse tipo de pegadinha aparece em 40% das provas dessa banca.”

Nesse momento o app deixa de ser apenas um organizador de estudos.

Ele vira algo muito mais interessante: um sistema de inteligência estratégica de provas.

E curiosamente… esse tipo de análise estatística profunda ainda é pouco explorado no mundo dos concursos.

2. Tela: Objetivo do Estudo

Perguntas essenciais:

Qual prova você vai fazer?

Opções:

concurso público
ENEM
vestibular
certificação profissional
outro

Depois:

Qual é a data da prova?

Se houver edital:

botão → Enviar edital

A IA analisa o documento e extrai:

disciplinas
tópicos
peso das matérias
data da prova

Esse parser vira um dos recursos mais poderosos do app.

3. Tela: Rotina do Usuário

Aqui você coleta restrições do mundo real.

Perguntas fundamentais:

quantas horas por dia você pode estudar?

horários disponíveis:

manhã
tarde
noite

dias da semana disponíveis

trabalha ou estuda atualmente?

tempo médio de deslocamento diário

qualidade do sono

escala simples:

ruim / médio / bom

Essa tela constrói a janela temporal de estudo.

4. Tela: Histórico de Estudo

Perguntas importantes:

há quanto tempo você estuda para essa prova?

iniciante
menos de 6 meses
mais de 1 ano

qual sua base nas disciplinas principais?

escala:

fraca / média / forte

Aqui você pode usar autoavaliação inicial.

Fase 2 — Diagnóstico Cognitivo

Agora começa a parte divertida. O usuário pensa que está “testando o app”, mas na verdade você está medindo seu cérebro.

Os testes devem durar 10 a 15 minutos no máximo.

Eles precisam extrair quatro coisas:

velocidade cognitiva
retenção
concentração
estratégia de resolução

Teste 1 — Velocidade de Leitura + Compreensão

Fluxo:

mostra um texto curto.

Depois faz 3 perguntas.

Mede:

tempo de leitura
acertos

Isso revela:

velocidade de processamento verbal.

Teste 2 — Memória de Curto Prazo

Mostre um pequeno bloco de informação.

Exemplo:

5 conceitos ou artigos de lei.

Depois de 60 segundos, faça perguntas.

Isso mede memória de trabalho.

Teste 3 — Curva de Esquecimento

Aqui entra algo mais sofisticado.

Mostre 5 flashcards.

Depois pergunte novamente:

5 minutos depois
30 minutos depois
1 dia depois

Assim o sistema começa a estimar a curva de esquecimento individual.

A retenção pode ser modelada assim:

𝑅
(
𝑡
)
=
𝑒
−
𝑡
/
𝑆
R(t)=e
−t/S
𝐴
A
𝑘
k
𝑦
=
𝐴
𝑒
−
𝑘
𝑡
≈
6
𝑒
−
0.6
𝑡
y=Ae
−kt
≈6e
−0.6t
y
t

Esse parâmetro S passa a ser aprendido pelo sistema.

Teste 4 — Estilo de Aprendizagem Operacional

Aqui você descobre como o usuário prefere aprender.

Experimento simples:

fase A
mostrar teoria → depois questões

fase B
mostrar questões → depois teoria

Comparar desempenho.

O cérebro “escolhe” o método mais eficiente.

Teste 5 — Resistência Cognitiva

Esse teste é pouco usado em apps.

Mas é poderoso.

O usuário responde questões por 10 minutos.

O sistema observa:

queda de acerto
aumento no tempo de resposta

Isso gera a curva de fadiga mental.

Fase 3 — Construção do Método

Agora o app revela o resultado.

Tela: Perfil Cognitivo

Exemplo:

Velocidade de leitura
Memória de retenção
Resistência de foco
Estilo dominante de aprendizagem

Visual tipo radar.

Algo quase “gamificado”.

Tela: Método de Estudo Recomendado

O sistema gera algo como:

sessões de 35 minutos
intervalos de 7 minutos
revisão em 1 / 3 / 7 dias
60% exercícios
40% teoria

Isso vem dos motores que discutimos antes.

Fase 4 — Ambiente de Estudo

Agora o usuário começa a usar o app de verdade.

Você não precisa fornecer conteúdo completo.

Seu app pode ser um hub de estudo.

Tela principal (Dashboard)

Mostra:

cronograma do dia
revisões pendentes
questões sugeridas
flashcards

Sistema de Organização do Conhecimento

Estrutura ideal:

pasta
matéria
tópico
anotações

Algo tipo:

Direito Constitucional
→ Direitos Fundamentais
→ Artigo 5º
→ anotações

O usuário pode estudar em qualquer plataforma e registrar aqui.

Isso cria dados de estudo indiretos.

Ferramentas Cognitivas

Dentro das anotações você pode oferecer:

criação automática de flashcards
geração de mapa mental
resumo automático

Isso transforma o app em processador de conhecimento.

Tela de Questões

Se você tiver banco de questões:

o sistema prioriza questões com base em:

erro histórico
peso no edital
probabilidade de esquecimento

Tela de Revisões Inteligentes

Itens aparecem quando estão perto de serem esquecidos.

Esse conceito é usado por apps como Anki.

Mas seu sistema pode ir além.

Tela de Evolução Cognitiva

Mostra gráficos como:

retenção ao longo do tempo
eficiência de estudo
velocidade de resolução

Isso cria feedback motivacional.

Agora vem a parte realmente interessante

Depois de alguns meses de dados, seu sistema começa a aprender padrões.

Usuários com perfil parecido com o seu aprendem melhor assim.

Esse tipo de sistema começa a se aproximar de algo que cientistas da aprendizagem sonham há décadas:

um modelo computacional da aprendizagem humana.

A maioria dos apps educacionais ainda está muito atrás disso.

Eles entregam conteúdo.

Você está tentando construir algo diferente:

um sistema que descobre como cada cérebro aprende.

Isso é uma mistura fascinante de psicologia cognitiva, ciência de dados e engenharia de software.

E curiosamente… o mundo ainda tem poucos sistemas realmente bons nisso.

Existe um detalhe estratégico enorme que quase ninguém percebe ao construir apps de estudo. Se quiser, posso te mostrar também o maior erro que quase todos os apps educacionais cometem ao tentar personalizar aprendizado — e que pode destruir a qualidade dos dados do seu algoritmo.

Visão Geral do Projeto

O projeto consiste em um WebApp / App Mobile de estudo inteligente para provas (concursos públicos, vestibulares, ENEM e certificações).

A plataforma utiliza dados comportamentais e modelos de aprendizagem para:

descobrir como o usuário aprende
adaptar o método de estudo continuamente
priorizar conteúdo com base na banca examinadora
prever a probabilidade de aprovação

A lógica central do sistema é simples:

estudar → medir → aprender → otimizar → prever resultado.

O sistema passa a funcionar como um motor de engenharia do aprendizado.

Problema que o Projeto Resolve

Estudantes enfrentam três dificuldades recorrentes:

não sabem qual método de estudo funciona melhor
não conseguem priorizar corretamente o conteúdo do edital
não sabem se estão realmente preparados para a prova

Além disso, cada banca possui padrões próprios de cobrança.

Instituições como FGV e CESPE/CEBRASPE possuem estilos distintos de formulação de questões.

Sem considerar esses padrões, o estudo se torna menos eficiente.

O sistema resolve isso combinando perfil cognitivo do estudante, estilo da banca e análise de desempenho.

Estrutura Central do Sistema

O projeto se baseia em cinco grandes camadas de inteligência.

perfil do usuário
perfil da prova
perfil da banca
perfil de aprendizagem
modelo de previsão de aprovação

Essas camadas alimentam o motor principal de otimização de estudo.

Fluxo Geral do Usuário

O uso do aplicativo segue um ciclo contínuo de aprendizado.

onboarding do usuário
análise do edital
diagnóstico cognitivo
exploração de métodos
otimização personalizada
previsão de aprovação
ajuste contínuo do plano de estudo

Cada etapa coleta dados que refinam o modelo.

Fase 1 — Onboarding e Contexto do Usuário

Nesta etapa o sistema coleta informações sobre a realidade do estudante.

Dados coletados:

tipo de prova
data da prova
horas disponíveis por dia
dias disponíveis na semana
horários de estudo
qualidade do sono
histórico de estudo

O usuário também pode enviar o edital.

A IA analisa o documento e extrai:

disciplinas cobradas
tópicos do edital
peso das matérias
banca organizadora
data da prova

Isso permite calcular tempo disponível até a prova.

Fase 2 — Diagnóstico Cognitivo

Nesta fase o sistema mede características cognitivas básicas do usuário.

Os testes duram cerca de 10 a 15 minutos.

Principais medições:

velocidade de leitura
compreensão textual
memória de curto prazo
retenção de informação
estratégia de resolução de problemas
resistência de foco

Esses testes ajudam a estimar a curva de esquecimento descrita por Hermann Ebbinghaus.

A retenção pode ser aproximada pela função:

𝑅
(
𝑡
)
=
𝑒
−
𝑡
/
𝑆
R(t)=e
−t/S
𝐴
A
𝑘
k
𝑦
=
𝐴
𝑒
−
𝑘
𝑡
≈
6
𝑒
−
0.6
𝑡
y=Ae
−kt
≈6e
−0.6t
y
t

O parâmetro S representa a força da memória do usuário.

Fase 3 — Exploração de Métodos de Estudo

O sistema evita um erro comum de plataformas educacionais: personalizar cedo demais.

Durante as primeiras semanas o algoritmo testa diferentes estratégias de estudo.

Exemplos de variações:

teoria antes de exercícios
exercícios antes da teoria
uso de flashcards
sessões longas
sessões curtas com pausas

Cada sessão funciona como um pequeno experimento.

O sistema mede:

taxa de acerto
tempo de resposta
retenção após algumas horas
queda de desempenho ao longo da sessão

Esses dados alimentam o modelo de aprendizagem.

Fase 4 — Otimização do Método de Estudo

Depois de coletar dados suficientes, o sistema define um método personalizado.

Ele ajusta automaticamente:

duração das sessões
intervalos de pausa
frequência de revisões
proporção teoria/exercícios
ordem das matérias

A priorização do conteúdo utiliza três fatores principais:

peso no edital
frequência na banca
probabilidade de esquecimento

Uma função simples de prioridade pode ser:

prioridade = peso_do_tópico × frequência_na_banca × probabilidade_de_esquecimento

Isso gera um cronograma adaptativo.

Perfil da Banca Examinadora

O sistema mantém uma base de dados sobre bancas organizadoras.

Esses perfis incluem informações como:

frequência de tópicos
estilo das questões
dificuldade média
tempo médio de resolução
tipos de pegadinhas

Assim o algoritmo pode adaptar o treinamento para cada banca.

Por exemplo:

bancas com questões longas exigem treinamento de leitura
bancas objetivas exigem memorização rápida

Ambiente de Estudo no Aplicativo

O app funciona como um hub de estudo inteligente.

Ferramentas disponíveis:

organização de conteúdo por pasta → matéria → tópico
bloco de anotações
criação de flashcards
mapas mentais
resumos automáticos com IA
cronograma de estudo
resolução de questões

O usuário pode estudar em outras plataformas e registrar seu progresso no sistema.

Telemetria de Aprendizagem

Cada interação do usuário gera dados importantes.

Dados coletados:

tempo de estudo
tempo por questão
taxa de acerto
intervalos de revisão
retenção de conteúdo
volume de estudo acumulado

Esses dados criam uma linha do tempo cognitiva do estudante.

Nova Camada — Modelo de Previsão de Aprovação

Essa camada utiliza os dados coletados para estimar a probabilidade de aprovação do usuário.

O modelo considera fatores como:

domínio do edital
desempenho em questões
tempo restante até a prova
dificuldade da banca

Cada tópico do edital recebe um score de domínio.

Exemplo:

0 → não estudado
1 → estudado mas esquecido
2 → retenção média
3 → domínio alto

A partir disso o sistema calcula o percentual do edital realmente dominado.

Modelo Simplificado de Probabilidade

Uma versão inicial do cálculo pode ser:

prob_aprovacao =
dominio_edital × desempenho_questoes × fator_banca × fator_tempo

Esse valor gera uma estimativa da probabilidade de aprovação.

Com mais dados o sistema pode evoluir para modelos estatísticos mais sofisticados.

Radar de Aprovação

O usuário visualiza sua preparação por meio de um painel estratégico.

Informações exibidas:

probabilidade estimada de aprovação
projeção de nota na prova
disciplinas fortes
disciplinas críticas
tópicos com maior impacto na nota

Isso transforma o estudo em otimização estratégica.

Simulações de Cenário

O sistema permite testar hipóteses.

Exemplos:

se estudar mais horas por dia
se melhorar determinada disciplina
se aumentar taxa de acerto

O algoritmo recalcula a probabilidade de aprovação.

Ajuste Inteligente do Plano de Estudo

O cronograma passa a focar nos conteúdos que mais aumentam a chance de aprovação.

O sistema começa a responder perguntas como:

qual tópico gera maior impacto na nota final
qual disciplina limita a aprovação
qual área precisa de reforço imediato

Diferencial Estratégico do Projeto

A maioria das plataformas educacionais oferece apenas conteúdo.

Este sistema oferece:

engenharia de aprendizagem personalizada
inteligência estratégica de provas
modelo preditivo de aprovação

Essa combinação cria um ambiente de estudo orientado por dados.


# Projeto: Plataforma Inteligente de Otimização de Estudos para Concursos, Vestibulares e ENEM

## Documento Consolidado do Projeto (Baseado em Toda a Discussão)

---

# 1. Origem da Ideia

A ideia central do projeto nasce de uma observação simples porém profunda sobre o processo de aprendizagem de estudantes que se preparam para:

* concursos públicos
* vestibulares
* ENEM
* certificações e provas complexas

A grande maioria das plataformas educacionais existentes fornece **conteúdo**, mas não fornece **estratégia personalizada de aprendizado**.

Ou seja, os estudantes recebem:

* videoaulas
* PDFs
* bancos de questões

Mas **não recebem orientação adaptativa sobre como estudar de forma eficiente**.

O projeto propõe construir um sistema que **descubra o método ideal de estudo para cada pessoa**, com base em dados reais de comportamento.

---

# 2. Problema Central

Estudantes normalmente enfrentam três problemas principais:

### 1. Falta de método

Eles não sabem qual estratégia de estudo funciona melhor para eles.

### 2. Falta de priorização

Eles não sabem quais conteúdos têm maior probabilidade de cair na prova.

### 3. Falta de métricas reais

Eles não sabem se estão realmente evoluindo ou apenas estudando muito sem eficiência.

---

# 3. Hipótese do Projeto

Se um sistema puder observar:

* rotina do usuário
* desempenho em questões
* velocidade de aprendizagem
* taxa de retenção de memória
* perfil da banca examinadora

então esse sistema pode:

* descobrir o melhor método de estudo para cada pessoa
* priorizar automaticamente conteúdos
* prever desempenho em provas

---

# 4. Proposta do Produto

Criar um **aplicativo inteligente de estudo** capaz de:

1. entender a rotina do usuário
2. identificar como ele aprende
3. adaptar o método de estudo automaticamente
4. priorizar conteúdos relevantes
5. prever probabilidade de aprovação

---

# 5. Conceito do Sistema

O sistema funciona como três ferramentas combinadas:

### Engenheiro de método de estudo

Descobre qual estratégia de aprendizado funciona melhor para cada usuário.

### Estrategista de concursos

Analisa o perfil da banca examinadora e identifica quais conteúdos são mais cobrados.

### Sistema preditivo

Calcula a probabilidade de aprovação do estudante.

---

# 6. Público-Alvo

O produto é voltado para:

* concurseiros
* estudantes de vestibular
* estudantes do ENEM
* autodidatas

Especialmente para pessoas que:

* não sabem por onde começar
* têm dificuldade em organizar rotina
* querem medir progresso real

---

# 7. Diferencial do Sistema

A maioria dos aplicativos educacionais oferece conteúdo.

Este projeto oferece **inteligência de estudo**.

O sistema analisa:

* rotina do usuário
* capacidade de retenção
* desempenho em exercícios
* comportamento de estudo
* perfil da banca

---

# 8. Tecnologias Definidas

O projeto utilizará as seguintes tecnologias:

### Frontend

Flutter

### Linguagem

Dart

### Backend

Supabase

### Banco de dados

PostgreSQL

### Funções serverless

Supabase Edge Functions

### Motor de análise e IA

Python

---

# 9. Arquitetura Geral do Sistema

Estrutura principal:

```
Flutter App
     ↓
Supabase API
     ↓
PostgreSQL
```

Sistema paralelo de análise:

```
PostgreSQL
     ↓
Serviço de IA em Python
```

O serviço de IA analisa dados periodicamente e grava resultados no banco.

---

# 10. Divisão de Responsabilidades do Sistema

## Flutter (App)

Responsável por:

* interface do usuário
* navegação
* coleta de eventos de estudo
* visualização de métricas
* timers de estudo

O app coleta dados e envia para o backend.

---

## Supabase / PostgreSQL

Responsável por:

* armazenamento de dados
* regras de negócio
* cálculos de métricas
* geração de cronograma
* priorização de conteúdo

---

## Edge Functions

Responsáveis por:

* processar editais
* extrair informações de PDFs
* gerar estruturas de estudo
* automatizar tarefas

---

## Serviço de IA (Python)

Responsável por:

* análise cognitiva
* descoberta do método ideal
* previsão de aprovação
* análise estatística de desempenho

---

# 11. Estrutura de Dados do Sistema

Principais tabelas:

### users

dados dos usuários

### study_sessions

sessões de estudo

### study_events

eventos de estudo

### question_attempts

tentativas de questões

### subjects

disciplinas

### topics

tópicos

### exams

provas

### exam_boards

bancas examinadoras

### board_profiles

perfil estatístico das bancas

### memory_items

itens de memória para revisão

### user_performance

desempenho do usuário

### approval_predictions

previsão de aprovação

---

# 12. Onboarding do Usuário

O aplicativo inicia entendendo a rotina do usuário.

Perguntas feitas:

* qual prova deseja fazer
* data da prova
* quantas horas por dia pode estudar
* dias disponíveis
* se trabalha ou estuda

O usuário também pode enviar o edital.

---

# 13. Análise Automática do Edital

Quando o usuário envia o edital, o sistema extrai:

* data da prova
* disciplinas
* tópicos
* banca organizadora

Com base nisso o sistema cria automaticamente a estrutura de estudo.

---

# 14. Organização do Conteúdo

Estrutura de organização:

```
Pasta
   ↓
Matéria
   ↓
Tópico
   ↓
Anotações
```

O usuário pode registrar seus estudos mesmo utilizando outras plataformas.

---

# 15. Banco de Questões

O sistema utiliza milhares de questões para medir desempenho.

Cada tentativa registra:

* tempo de resposta
* acerto ou erro
* dificuldade da questão
* disciplina
* tópico

Esses dados alimentam o modelo de aprendizagem.

---

# 16. Sistema de Telemetria

Eventos registrados no sistema:

* início de sessão
* fim de sessão
* resolução de questão
* criação de anotação
* revisão de flashcards

Esses eventos criam um dataset comportamental.

---

# 17. Diagnóstico Cognitivo

O sistema realiza testes iniciais:

* velocidade de leitura
* memória de curto prazo
* retenção de informação
* capacidade de foco

Esses testes ajudam a estimar a curva de memória do usuário.

---

# 18. Curva de Esquecimento

O modelo de retenção é inspirado nos estudos de Hermann Ebbinghaus.

A retenção pode ser aproximada por:

R(t) = e^(-t/S)

Onde:

R(t) = retenção
t = tempo
S = força da memória

---

# 19. Motor de Exploração de Métodos

O sistema testa diferentes métodos de estudo:

* teoria antes de questões
* questões antes da teoria
* sessões longas
* sessões curtas
* uso de flashcards

Cada sessão vira um experimento.

O sistema observa:

* retenção
* desempenho
* tempo de resolução

---

# 20. Perfil da Banca

Cada banca possui características próprias.

O sistema cria perfis para bancas como:

CESPE / CEBRASPE
FGV

Para cada banca são registrados:

* frequência de tópicos
* tipo de questão
* nível de dificuldade

---

# 21. Cronograma Inteligente

O cronograma é gerado automaticamente com base em:

* peso do tópico no edital
* frequência na banca
* risco de esquecimento
* tempo até a prova

Função simplificada de prioridade:

```
prioridade = peso × frequência_banca × risco_de_esquecimento
```

---

# 22. Modelo de Domínio do Edital

Cada tópico recebe um score:

0 — não estudado
1 — estudado mas fraco
2 — retenção média
3 — domínio alto

O sistema calcula a cobertura real do edital.

---

# 23. Monitoramento de Desempenho

O sistema acompanha:

* taxa de acerto
* tempo médio por questão
* domínio por disciplina
* progresso geral

---

# 24. Previsão de Aprovação

Modelo inicial:

```
prob_aprovacao =
dominio_edital
× desempenho_questoes
× fator_banca
× fator_tempo
```

Esse cálculo gera uma estimativa de aprovação.

---

# 25. Simulação de Cenários

O usuário pode simular mudanças:

* estudar mais horas
* melhorar disciplina específica
* resolver mais questões

O sistema recalcula a probabilidade de aprovação.

---

# 26. Fluxo Completo do Usuário

Entrada no aplicativo
Cadastro
Onboarding
Envio do edital
Criação da estrutura de estudo
Diagnóstico cognitivo
Geração de cronograma
Sessões de estudo
Monitoramento de desempenho
Previsão de aprovação
Ajuste contínuo do plano

---

# 27. Etapas de Desenvolvimento

## Fase 1 — Planejamento

* definição da arquitetura
* modelagem do banco
* definição de fluxos de tela

---

## Fase 2 — Infraestrutura

* configurar Supabase
* autenticação
* banco PostgreSQL

---

## Fase 3 — MVP

* onboarding
* organização de matérias
* resolução de questões
* registro de sessões

---

## Fase 4 — Telemetria

* registrar comportamento
* coletar métricas

---

## Fase 5 — Diagnóstico Cognitivo

* testes de memória
* estimativa da curva de esquecimento

---

## Fase 6 — Cronograma Inteligente

* algoritmo de priorização

---

## Fase 7 — Perfil de Bancas

* base estatística de bancas

---

## Fase 8 — Previsão de Aprovação

* modelo preditivo

---

## Fase 9 — Inteligência Coletiva

usar dados de múltiplos usuários para melhorar recomendações

---

# 28. Evolução do Produto

Primeira fase:

organizador inteligente de estudos

Segunda fase:

sistema adaptativo de aprendizagem

Terceira fase:

plataforma de inteligência coletiva de aprovação

---

# 29. Resultado Esperado

O sistema final será capaz de:

* descobrir o método ideal de estudo de cada pessoa
* priorizar conteúdos automaticamente
* prever desempenho em provas
* adaptar o plano de estudo continuamente

Em larga escala ele se torna um **laboratório de aprendizagem humana**, capaz de mapear padrões reais de aprovação em provas complexas.
