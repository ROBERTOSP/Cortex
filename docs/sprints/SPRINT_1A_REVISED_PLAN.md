# Sprint 1A (Revised) — Onboarding + Routine Intelligence v1

Este documento é a fonte de verdade da Sprint 1A. Ele consolida e substitui quaisquer trechos anteriores incompletos ou implícitos sobre a Sprint 1A.

## Objetivo

Implementar uma rotina semanal real (janelas + compromissos + preferências + timezone) para que o backend calcule, de forma determinística, a capacidade de estudo diária e semanal (“Capacidade inicial declarada”).

## Regras e restrições (Sprint 1A)

- Não implementar cronograma definitivo nem alterar o comportamento atual do `PlanningService`.
- Backend é a única fonte de verdade para cálculos.
- Web App e extensão não calculam capacidade localmente.
- Não usar IA para calcular rotina/capacidade.
- Manter campos legados no `User` (compatibilidade temporária).
- Não persistir múltiplas rotinas por usuário na 1A.
- Rotina persistida e operacional na 1A: apenas a declarada.

## Decisão: `StudyGoal` (obrigatório)

Na Sprint 1A:

- Cada usuário terá no máximo um objetivo provisório ativo (limitação intencional do MVP).
- O objetivo permanece separado da rotina (não faz parte de `UserRoutine`).
- O objetivo ainda não será vinculado ao `Contest` (isso será feito na Sprint 1B).
- Atualizar o objetivo provisório substitui o conteúdo do registro atual e não mantém histórico na Sprint 1A (histórico via snapshots/eventos fica para sprint futura).
- Validação obrigatória do objetivo (Sprint 1A):
  - `examDate` preenchida; ou
  - `examDateUnknown = true`

Evolução prevista para a Sprint 1B:

- Opção A (recomendada): `StudyGoal` passa a aceitar múltiplos registros por usuário e um deles é o ativo (`activeStudyGoalId` no `User` ou campo `status` no `StudyGoal`).
- Opção B: vínculo `StudyGoal` → `Contest` via `contestId` (ex.: `studyGoal.contestId`) e histórico por snapshots/eventos.

## 1) Schema Prisma completo (novas entidades + alterações no `User`)

O schema abaixo descreve apenas o que será adicionado/alterado na Sprint 1A (não inclui os demais modelos existentes no projeto).

### Enums

```prisma
enum StudyGoalType {
  APPROVAL
  GENERAL_STUDY
  CAREER_TRANSITION
}

enum StudyGoalPhase {
  PRE_NOTICE
  POST_NOTICE
}

enum StudyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum EnergyPeriod {
  MORNING
  AFTERNOON
  EVENING
  NIGHT
}

enum FatigueLevel {
  LOW
  MEDIUM
  HIGH
}

enum StudyContext {
  HOME
  WORK
  COMMUTE
  LIBRARY
  OTHER
}

enum DeviceType {
  DESKTOP
  LAPTOP
  TABLET
  PHONE
  PAPER
}

enum WindowFlexibility {
  STRICT
  FLEXIBLE
}

enum AllowedActivity {
  THEORY
  REVIEW
  QUESTIONS
  FLASHCARDS
  VIDEO
  AUDIO
  NOTES
  SIMULATION
  ESSAY_PRACTICE
}

enum CommitmentCategory {
  WORK
  COMMUTE
  COLLEGE
  FAMILY
  EXERCISE
  OTHER
}

enum PlanMode {
  RIGID
  FLEXIBLE
}

enum MissedDayStrategy {
  REDISTRIBUTE
  ASK_BEFORE
  KEEP_PENDING
  DROP_LOW_PRIORITY
}

enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
  SUN
}
```

### Alterações necessárias no `User`

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  name            String?
  avatarUrl       String?
  googleId        String?  @unique
  tokens          Int      @default(100)

  // Perfil Cognitivo / Rotina (legado - manter)
  studyLevel      String?
  dailyStudyHours Int?
  fatigueLevel    String?
  peakEnergyTime  String?
  works           Boolean  @default(false)

  // Novo onboarding v1 (Sprint 1A)
  onboardingVersion Int    @default(0) @map("onboarding_version")

  studyGoal       StudyGoal?
  routine         UserRoutine?
  dailyCheckIns   DailyCheckIn[]

  contests        Contest[]
  studySessions   StudySession[]
  questionAttempts QuestionAttempt[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("users")
}
```

### Novos modelos

```prisma
model StudyGoal {
  id          String        @id @default(uuid())

  userId      String        @unique @map("user_id")
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        StudyGoalType
  studyLevel  StudyLevel    @map("study_level")

  title       String        @map("title")
  targetJob   String        @map("target_job")
  board       String?       @map("board")

  examDate    DateTime?     @map("exam_date")
  examDateUnknown Boolean   @default(false) @map("exam_date_unknown")

  phase       StudyGoalPhase @map("phase")

  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@index([type])
  @@map("study_goals")
}

model UserRoutine {
  id          String        @id @default(uuid())

  userId      String        @unique @map("user_id")
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  onboardingSchemaVersion Int @default(1) @map("onboarding_schema_version")

  timezone    String?       @map("timezone")

  wakeTimeMinute  Int?      @map("wake_time_minute")
  sleepTimeMinute Int?      @map("sleep_time_minute")

  peakEnergyPeriod     EnergyPeriod? @map("peak_energy_period")
  habitualFatigueLevel FatigueLevel? @map("habitual_fatigue_level")

  preferredSessionMinutes Int?       @map("preferred_session_minutes")
  planMode                PlanMode?  @map("plan_mode")
  maxSubjectsPerDay       Int?       @map("max_subjects_per_day")

  wantsDayOff          Boolean       @default(false) @map("wants_day_off")
  dayOffPreference     DayOfWeek?    @map("day_off_preference")

  badDayMinimumMinutes Int?          @map("bad_day_minimum_minutes")
  missedDayStrategy    MissedDayStrategy? @map("missed_day_strategy")

  routineOnboardingCompletedAt DateTime? @map("routine_onboarding_completed_at")

  availabilityWindows  AvailabilityWindow[]
  commitments          RoutineCommitment[]
  dailyCheckIns        DailyCheckIn[]

  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@index([timezone])
  @@map("user_routines")
}

model AvailabilityWindow {
  id          String           @id @default(uuid())

  routineId   String           @map("routine_id")
  routine     UserRoutine      @relation(fields: [routineId], references: [id], onDelete: Cascade)

  dayOfWeek   DayOfWeek        @map("day_of_week")
  startMinute Int              @map("start_minute")
  endMinute   Int              @map("end_minute")

  context     StudyContext
  devices     DeviceType[]     @default([]) @map("devices")
  flexibility WindowFlexibility

  allowedActivities AllowedActivity[] @default([]) @map("allowed_activities")

  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  @@unique([routineId, dayOfWeek, startMinute, endMinute])
  @@index([routineId, dayOfWeek])
  @@index([routineId, dayOfWeek, startMinute])
  @@map("availability_windows")
}

model RoutineCommitment {
  id          String           @id @default(uuid())

  routineId   String           @map("routine_id")
  routine     UserRoutine      @relation(fields: [routineId], references: [id], onDelete: Cascade)

  category    CommitmentCategory
  dayOfWeek   DayOfWeek        @map("day_of_week")
  startMinute Int              @map("start_minute")
  endMinute   Int              @map("end_minute")
  flexibility WindowFlexibility

  note        String?          @db.VarChar(140)

  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  @@unique([routineId, dayOfWeek, startMinute, endMinute, category])
  @@index([routineId, dayOfWeek])
  @@index([routineId, dayOfWeek, startMinute])
  @@map("routine_commitments")
}

model DailyCheckIn {
  id          String   @id @default(uuid())

  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  routineId   String?  @map("routine_id")
  routine     UserRoutine? @relation(fields: [routineId], references: [id], onDelete: SetNull)

  dateKey     String   @map("date_key")
  timezone    String   @map("timezone")

  energy      Int
  focus       Int
  fatigue     Int

  availableMinutesOverride Int? @map("available_minutes_override")

  note        String?  @db.VarChar(200)

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([userId, dateKey])
  @@map("daily_check_ins")
}
```

Nota sobre índices (Sprint 1A): em `DailyCheckIn`, `@@unique([userId, dateKey])` já cria um índice composto suficiente para o acesso típico (buscar o check-in de um usuário em um dia). Índices adicionais só serão adicionados quando existir uma consulta concreta que os justifique.

## 2) Lista completa de enums (obrigatório)

Os enums e seus valores são exatamente os definidos na seção “Enums” acima:

- `StudyGoalType`: `APPROVAL`, `GENERAL_STUDY`, `CAREER_TRANSITION`
- `StudyGoalPhase`: `PRE_NOTICE`, `POST_NOTICE`
- `StudyLevel`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `EnergyPeriod`: `MORNING`, `AFTERNOON`, `EVENING`, `NIGHT`
- `FatigueLevel`: `LOW`, `MEDIUM`, `HIGH`
- `StudyContext`: `HOME`, `WORK`, `COMMUTE`, `LIBRARY`, `OTHER`
- `DeviceType`: `DESKTOP`, `LAPTOP`, `TABLET`, `PHONE`, `PAPER`
- `WindowFlexibility`: `STRICT`, `FLEXIBLE`
- `AllowedActivity`: `THEORY`, `REVIEW`, `QUESTIONS`, `FLASHCARDS`, `VIDEO`, `AUDIO`, `NOTES`, `SIMULATION`, `ESSAY_PRACTICE`

Nota: `ESSAY_PRACTICE` substitui o conceito genérico de “WRITING” para representar explicitamente prática discursiva/redação. Texto e tradução pertencem à interface.
- `CommitmentCategory`: `WORK`, `COMMUTE`, `COLLEGE`, `FAMILY`, `EXERCISE`, `OTHER`
- `PlanMode`: `RIGID`, `FLEXIBLE`
- `MissedDayStrategy`: `REDISTRIBUTE`, `ASK_BEFORE`, `KEEP_PENDING`, `DROP_LOW_PRIORITY`

## 3) Rotas e regra de acesso (matriz obrigatória)

Regra geral da Sprint 1A:

- Todos os endpoints de rotina/check-in exigem autenticação.
- Todos usam exclusivamente o usuário obtido pelo token.
- Nenhum recebe `userId` no payload.
- Nenhum exige onboarding v1 apenas para permitir concluir o onboarding.
- Endpoints futuros que dependem de capacidade confirmada poderão exigir onboarding v1 (fora do escopo 1A).
- O cronograma da Sprint 1B deverá exigir rotina v1 concluída.

Matriz:

| Endpoint | Autenticação | Exige onboarding v1 | Observação |
|---|---:|---:|---|
| `GET /routine/me` | Sim | Não | Retorna rotina (draft ou concluída) + status do onboarding v1 |
| `PUT /routine/me` | Sim | Não | Salva/atualiza rascunho (preferências/timezone) sem concluir |
| `PUT /routine/me/availability-windows` | Sim | Não | Substituição transacional completa das janelas |
| `PUT /routine/me/commitments` | Sim | Não | Substituição transacional completa dos compromissos |
| `GET /routine/me/capacity-preview` | Sim | Não | Preview semanal recorrente (sem `weekStartDate`, sem check-in) |
| `POST /routine/me/capacity-week` | Sim | Não | Capacidade de uma semana real via `weekStartDate` (pode aplicar check-in se existir para o dia correspondente) |
| `GET /routine/me/capacity-today` | Sim | Não | Capacidade “de hoje” (timezone do usuário) aplicando check-in do `dateKey` de hoje, se existir |
| `PUT /routine/me/goal` | Sim | Não | Cria/atualiza o objetivo provisório |
| `PUT /routine/me/check-in` | Sim | Não | Cria/atualiza check-in do `dateKey` (1 por dia) |
| `POST /routine/me/complete` | Sim | Não | Valida tudo, registra confirmação explícita e marca v1 concluído |
| `POST /planning/schedule` (Sprint 1B) | Sim | Sim | Passa a exigir `onboardingVersion=1` |

## 4) Semântica do check-in (obrigatório)

Na Sprint 1A:

- `availableMinutesOverride` funciona como limite superior da capacidade calculada:
  - `finalMinutes = min(calculatedMinutes, availableMinutesOverride)` quando override está presente
  - não cria tempo fora das janelas cadastradas
- Se `availableMinutesOverride < calculatedMinutes`, o engine deve reduzir capacidade sem “inventar” disponibilidade:
  - aplicar o cap removendo minutos do fim das janelas menos recomendadas, sem cruzar intervalos e sem mesclar intervalos separados
- Se `availableMinutesOverride > calculatedMinutes`:
  - manter `finalMinutes = calculatedMinutes`
  - retornar um aviso: “tempo adicional exige janela temporária”
  - não implementar janela temporária na 1A
- O check-in:
  - altera somente o `dateKey` correspondente
  - não modifica a rotina
  - tem nota limitada
  - respeita timezone
  - não aceita datas futuras fora da regra definida

## 5) Timezone e virada do dia (obrigatório)

### Validação de timezone IANA

- O backend valida `timezone` como identificador IANA (ex.: `America/Sao_Paulo`).
- Validação recomendada (conceito): tentar instanciar `Intl.DateTimeFormat` com `timeZone=timezone` e rejeitar em caso de `RangeError`.

### Timezone padrão

- Timezone padrão só é aplicado quando estritamente necessário (ex.: usuário ainda não definiu timezone).
- Após o usuário confirmar o onboarding v1, não alterar timezone silenciosamente.

### `dateKey` (validação e cálculo)

- Formato aceito: `YYYY-MM-DD`.
- O backend:
  - valida o formato via regex
  - interpreta o `dateKey` no timezone do usuário
  - calcula o “dia da semana” com base no timezone do usuário, não no timezone do servidor
  - impede datas futuras: `dateKey > todayInUserTimezone` deve ser rejeitado (regra padrão 1A)

### `weekStartDate` e saída por semana real

- O cálculo semanal “real” usa `weekStartDate` (formato `YYYY-MM-DD`) como referência.
- A saída semanal sempre inclui, por dia:
  - `dateKey`
  - `dayOfWeek`
- Um check-in só pode ser aplicado ao dia cujo `dateKey` coincide exatamente com o check-in.

### Janelas atravessando meia-noite

- Não aceitar janelas que atravessam meia-noite na Sprint 1A.
- Se o usuário tentar cadastrar `23:00 → 01:00`:
  - a interface deve dividir em duas:
    - dia atual `23:00 → 24:00`
    - dia seguinte `00:00 → 01:00`

## 6) Disponibilidade e compromissos (obrigatório)

Regra confirmada (Sprint 1A):

- `AvailabilityWindow` representa tempo potencial.
- `RoutineCommitment` representa bloqueio.
- Somente a interseção é subtraída.
- O engine devolve os segmentos restantes (podendo “quebrar” uma janela).
- Compromissos fora de janelas não alteram a capacidade.
- Compromissos sobrepostos devem ser rejeitados (reduz ambiguidade).

Exemplos (janela `19:00–21:00`):

- Compromisso no meio (`20:00–20:30`):
  - restante: `19:00–20:00` e `20:30–21:00`
- Compromisso no início (`19:00–19:20`):
  - restante: `19:20–21:00`
- Compromisso no final (`20:40–21:00`):
  - restante: `19:00–20:40`
- Compromisso cobrindo toda a janela (`18:00–22:00`):
  - restante: nenhum segmento (0 minutos)
- Compromisso sem interseção (`17:00–18:00`):
  - restante: `19:00–21:00` (sem mudança)

## 7) Routine Engine v1 (regras)

### Diretriz de cálculo para `DECLARED_ONLY`

Na Sprint 1A, o engine deve operar com `confidence = "DECLARED_ONLY"` e obedecer:

- Não reduzir minutos livres com percentuais arbitrários de fadiga/energia.
- Preservar `grossMinutes` e `netMinutes`.
- Definir `sustainableMinutes = netMinutes` (na 1A).
- Usar energia/fadiga declaradas para:
  - ordenar janelas (recomendação)
  - recomendar alocação de atividades mais exigentes
  - gerar avisos (ex.: “janela fora do pico declarado”)
- Fatores de redução quantitativa ficam para fases futuras com dados observados (`OBSERVED`/`CALIBRATED`), fora do escopo 1A.

Sobre sono/horários (Sprint 1A):

- `wakeTimeMinute` e `sleepTimeMinute` são opcionais no banco durante a Sprint 1A.
- O engine v1 não depende desses campos para calcular minutos (capacidade declarada). Se informados, podem ser usados apenas para recomendações não-bloqueantes (ex.: avisos de janela muito tarde), sem reduzir capacidade.

### Limites de sessão (MVP)

- Mínimo: 20 minutos
- Máximo: 60 minutos
- Janelas maiores são divididas em blocos

### Energia: pico declarado e classificação por janela

- O engine define os intervalos de horário (em minutos) para `EnergyPeriod`:
  - `MORNING`: 05:00–11:59
  - `AFTERNOON`: 12:00–16:59
  - `EVENING`: 17:00–20:59
  - `NIGHT`: 21:00–04:59
- Para cada `finalInterval`, o engine calcula uma classificação relativa ao pico declarado do usuário:
  - `MATCHES_DECLARED_PEAK`
  - `ADJACENT_TO_PEAK`
  - `OUTSIDE_PEAK`
- Na Sprint 1A, essa classificação é usada para ordenar janelas e recomendar atividades, sem reduzir minutos.

### Cálculo de blocos por `finalInterval` (obrigatório)

O engine deve dividir blocos por intervalo final individualmente. Nunca somar intervalos separados para criar um bloco que atravesse compromisso ou período indisponível.

Regras:

- Para cada `finalInterval`, criar blocos inteiros de `recommendedSessionMinutes` enquanto possível.
- Se sobrar `>= 20` minutos dentro do mesmo `finalInterval`, criar um bloco residual.
- Se sobrar `< 20` minutos dentro do mesmo `finalInterval`, descartar e registrar justificativa.

Não usar apenas `floor(total / recommended)`.

### Separação “blocos” vs “matérias”

- `maximumBlocks` deriva da capacidade (quantos blocos cabem).
- `maxSubjectsPerDay` deriva de preferência.
- Vários blocos podem pertencer à mesma matéria.

### Classificação de dias

- `daysWithoutAvailability`: 0 minutos finais
- `lowCapacityDays`: >0 e < mínimo de sessão
- `highConstraintDays`: alto impacto de compromissos (critério na config)

### Transparência da saída

Toda saída inclui:

- `engineVersion`
- `confidence = "DECLARED_ONLY"`
- lista de `adjustments` com minutos antes/depois e códigos padronizados
- motivos de descarte de tempo (ex.: residual abaixo do mínimo)

## 8) Exemplo completo do Routine Engine (entrada/saída)

### Entrada (exemplo)

```json
{
  "timezone": "America/Sao_Paulo",
  "weekStartDate": "2026-07-20",
  "preferences": {
    "planMode": "FLEXIBLE",
    "preferredSessionMinutes": 45,
    "maxSubjectsPerDay": 3,
    "badDayMinimumMinutes": 20,
    "missedDayStrategy": "ASK_BEFORE",
    "peakEnergyPeriod": "EVENING",
    "habitualFatigueLevel": "MEDIUM"
  },
  "availabilityWindows": [
    {
      "dayOfWeek": "MON",
      "startMinute": 1140,
      "endMinute": 1210,
      "context": "HOME",
      "devices": ["LAPTOP", "PHONE"],
      "flexibility": "FLEXIBLE",
      "allowedActivities": ["THEORY", "QUESTIONS", "VIDEO"]
    },
    {
      "dayOfWeek": "WED",
      "startMinute": 390,
      "endMinute": 540,
      "context": "COMMUTE",
      "devices": ["PHONE"],
      "flexibility": "STRICT",
      "allowedActivities": ["FLASHCARDS", "REVIEW", "AUDIO"]
    },
    {
      "dayOfWeek": "WED",
      "startMinute": 1200,
      "endMinute": 1235,
      "context": "HOME",
      "devices": ["LAPTOP"],
      "flexibility": "FLEXIBLE",
      "allowedActivities": ["QUESTIONS", "NOTES"]
    },
    {
      "dayOfWeek": "FRI",
      "startMinute": 600,
      "endMinute": 619,
      "context": "HOME",
      "devices": ["PHONE"],
      "flexibility": "FLEXIBLE",
      "allowedActivities": ["REVIEW"]
    }
  ],
  "commitments": [
    {
      "dayOfWeek": "WED",
      "startMinute": 420,
      "endMinute": 480,
      "category": "COMMUTE",
      "flexibility": "STRICT"
    }
  ],
  "checkIn": {
    "dateKey": "2026-07-20",
    "energy": 4,
    "focus": 3,
    "fatigue": 2,
    "availableMinutesOverride": 65,
    "note": "Sono ok, mas pouco tempo."
  }
}
```

### Saída (exemplo)

```json
{
  "engineVersion": "routine-v1",
  "confidence": "DECLARED_ONLY",
  "timezone": "America/Sao_Paulo",
  "weekStartDate": "2026-07-20",
  "weekly": {
    "grossMinutes": 274,
    "netMinutes": 214,
    "sustainableMinutes": 214,
    "maximumBlocks": 5,
    "maxSubjectsPerDay": 3
  },
  "days": [
    {
      "dateKey": "2026-07-20",
      "dayOfWeek": "MON",
      "grossMinutes": 70,
      "netMinutes": 70,
      "sustainableMinutes": 70,
      "recommendedSessionMinutes": 45,
      "finalIntervals": [
        {
          "startMinute": 1140,
          "endMinute": 1205,
          "allowedActivities": ["THEORY", "QUESTIONS", "VIDEO"],
          "devices": ["LAPTOP", "PHONE"]
        }
      ],
      "blocks": [45, 20],
      "discardedMinutes": [],
      "adjustments": [
        {
          "stage": "DECLARED_ONLY",
          "minutesBefore": 70,
          "minutesAfter": 70,
          "reasonCode": "DECLARED_ONLY_NO_MINUTE_REDUCTION"
        },
        {
          "stage": "CHECKIN_CAP",
          "minutesBefore": 70,
          "minutesAfter": 65,
          "reasonCode": "CHECKIN_CAP_APPLIED"
        },
        {
          "stage": "PEAK_CLASSIFICATION",
          "minutesBefore": 65,
          "minutesAfter": 65,
          "reasonCode": "MATCHES_DECLARED_PEAK"
        }
      ]
    },
    {
      "dateKey": "2026-07-22",
      "dayOfWeek": "WED",
      "grossMinutes": 185,
      "netMinutes": 125,
      "sustainableMinutes": 125,
      "recommendedSessionMinutes": 45,
      "finalIntervals": [
        {
          "startMinute": 390,
          "endMinute": 420,
          "allowedActivities": ["FLASHCARDS", "REVIEW", "AUDIO"],
          "devices": ["PHONE"]
        },
        {
          "startMinute": 480,
          "endMinute": 540,
          "allowedActivities": ["FLASHCARDS", "REVIEW", "AUDIO"],
          "devices": ["PHONE"]
        },
        {
          "startMinute": 1200,
          "endMinute": 1235,
          "allowedActivities": ["QUESTIONS", "NOTES"],
          "devices": ["LAPTOP"]
        }
      ],
      "blocks": [30, 45, 35],
      "discardedMinutes": [
        { "minutes": 15, "reasonCode": "RESIDUAL_BELOW_MIN_SESSION" }
      ],
      "adjustments": [
        {
          "stage": "SUBTRACT_COMMITMENTS",
          "minutesBefore": 185,
          "minutesAfter": 125,
          "reasonCode": "COMMITMENT_INTERSECTION_REMOVED"
        },
        {
          "stage": "DECLARED_ONLY",
          "minutesBefore": 125,
          "minutesAfter": 125,
          "reasonCode": "DECLARED_ONLY_NO_MINUTE_REDUCTION"
        },
        {
          "stage": "PEAK_CLASSIFICATION",
          "minutesBefore": 125,
          "minutesAfter": 125,
          "reasonCode": "OUTSIDE_PEAK"
        }
      ]
    },
    {
      "dateKey": "2026-07-24",
      "dayOfWeek": "FRI",
      "grossMinutes": 19,
      "netMinutes": 19,
      "sustainableMinutes": 19,
      "recommendedSessionMinutes": 45,
      "finalIntervals": [
        {
          "startMinute": 600,
          "endMinute": 619,
          "allowedActivities": ["REVIEW"],
          "devices": ["PHONE"]
        }
      ],
      "blocks": [],
      "discardedMinutes": [
        { "minutes": 19, "reasonCode": "RESIDUAL_BELOW_MIN_SESSION" }
      ],
      "adjustments": [
        {
          "stage": "DECLARED_ONLY",
          "minutesBefore": 19,
          "minutesAfter": 19,
          "reasonCode": "DECLARED_ONLY_NO_MINUTE_REDUCTION"
        },
        {
          "stage": "PEAK_CLASSIFICATION",
          "minutesBefore": 19,
          "minutesAfter": 19,
          "reasonCode": "OUTSIDE_PEAK"
        }
      ]
    }
  ],
  "classifications": {
    "daysWithoutAvailability": ["TUE", "THU", "SAT", "SUN"],
    "lowCapacityDays": ["FRI"],
    "highConstraintDays": ["WED"]
  }
}
```

### Cálculos intermediários (do exemplo)

- `WED` janela `06:30–09:00` (150m) com compromisso `07:00–08:00` (60m) gera `finalIntervals`:
  - `06:30–07:00` (30m) → blocos: `[30]`
  - `08:00–09:00` (60m) → blocos: `[45]` + residual `15` (descartado)
- `MON` calculado `70m`, check-in cap `65m`:
  - intervalo final truncado para `65m` → blocos: `[45, 20]`
- `FRI` intervalo `19m`:
  - residual `< 20` descartado → 0 blocos

## 9) Configuração versionada (`src/routine-engine/config.ts`) (obrigatório)

Conteúdo proposto:

```ts
export const ROUTINE_ENGINE_VERSION = "routine-v1" as const;

export const ROUTINE_ENGINE_LIMITS = {
  sessionMinutes: {
    min: 20,
    max: 60,
  },
  dayClassification: {
    lowCapacityBelowMinutes: 20,
    highConstraint: {
      reductionRatioThreshold: 0.5,
      reductionMinutesThreshold: 60,
    },
  },
  checkIn: {
    ratingMin: 1,
    ratingMax: 5,
    noteMaxLength: 200,
    availableMinutesOverride: {
      min: 0,
      max: 600,
    },
    maxDaysInFutureAllowed: 0,
  },
} as const;

export const ROUTINE_ENGINE_TIME_OF_DAY = {
  MORNING: { startMinute: 300, endMinuteExclusive: 720 },
  AFTERNOON: { startMinute: 720, endMinuteExclusive: 1020 },
  EVENING: { startMinute: 1020, endMinuteExclusive: 1260 },
  NIGHT: { startMinute: 1260, endMinuteExclusive: 300 },
} as const;

export const ROUTINE_ENGINE_REASON_CODES = {
  COMMITMENT_INTERSECTION_REMOVED: "COMMITMENT_INTERSECTION_REMOVED",
  RESIDUAL_BELOW_MIN_SESSION: "RESIDUAL_BELOW_MIN_SESSION",
  DECLARED_ONLY_NO_MINUTE_REDUCTION: "DECLARED_ONLY_NO_MINUTE_REDUCTION",
  MATCHES_DECLARED_PEAK: "MATCHES_DECLARED_PEAK",
  ADJACENT_TO_PEAK: "ADJACENT_TO_PEAK",
  OUTSIDE_PEAK: "OUTSIDE_PEAK",
  CHECKIN_CAP_APPLIED: "CHECKIN_CAP_APPLIED",
  CHECKIN_OVERRIDE_IGNORED_EXCEEDS_CAPACITY: "CHECKIN_OVERRIDE_IGNORED_EXCEEDS_CAPACITY",
  INVALID_TIMEZONE: "INVALID_TIMEZONE",
  INVALID_DATE_KEY: "INVALID_DATE_KEY",
  DATE_IN_FUTURE: "DATE_IN_FUTURE",
} as const;
```

## 10) Segurança do banco de teste (script de migração em DB descartável)

O teste com banco real descartável deve falhar com segurança se não houver garantias fortes.

Requisitos mínimos:

- Exigir `NODE_ENV=test`.
- Exigir variáveis exclusivas para teste (ex.: `TEST_DATABASE_URL_ADMIN` e `TEST_DATABASE_NAME_PREFIX`).
- Exigir que o recurso de teste tenha identificação clara (ex.: DB/schema começando com `test_` e contendo um UUID gerado pelo próprio teste).
- Confirmar explicitamente que `TEST_DATABASE_URL_ADMIN` é diferente de `DATABASE_URL`.
- Exigir allowlist de destino de teste:
  - `TEST_DATABASE_ALLOWED_HOSTS` (lista explícita)
  - se o host do `TEST_DATABASE_URL_ADMIN` não estiver na allowlist, parar sem executar
- Exigir blocklist explícita de destinos proibidos (defesa em profundidade):
  - `TEST_DATABASE_FORBIDDEN_HOSTS` (lista explícita)
  - se o host estiver na blocklist, parar sem executar
- Criar/limpar somente o recurso criado pelo próprio teste (ex.: DB com UUID gerado pelo script).

Se qualquer condição falhar, o script deve encerrar sem executar.

## 11) Migration e seed (documentação)

- Nome conceitual da migration: `sprint1a_routine_v1`
- Comandos Prisma (conceituais):
  - `npm run prisma:generate`
  - `npm run prisma:migrate:dev -- --name sprint1a_routine_v1` (apenas quando autorizado)
  - `npm run prisma:migrate:deploy` (em ambiente que já possua a migration criada)
- Rollback: por restauração de banco (backup/restore). Não criar downgrade manual inseguro.
- Seed:
  - deve ser idempotente
  - validação: executar seed duas vezes e não gerar duplicatas
- Usuários existentes:
  - `onboardingVersion` permanece `0`
  - nenhuma rotina será criada automaticamente por “invenção” de dados

## 12) Critério exato de conclusão (pseudocódigo)

O onboarding v1 só é concluído no endpoint de confirmação explícita (`POST /routine/me/complete`).

```ts
function isRoutineOnboardingV1Complete(input: {
  goal: StudyGoal | null;
  routine: UserRoutine | null;
  windows: AvailabilityWindow[];
  commitments: RoutineCommitment[];
  userConfirmed: boolean;
}): boolean {
  if (!input.userConfirmed) return false;
  if (!input.goal) return false;
  if (!input.routine) return false;

  if (!input.routine.timezone) return false;
  if (!isValidIanaTimezone(input.routine.timezone)) return false;

  if (input.windows.length < 1) return false;
  if (!allWindowsValid(input.windows)) return false;
  if (!noOverlappingWindows(input.windows)) return false;

  if (!allWindowsHaveAtLeastOneActivity(input.windows)) return false;
  if (!allWindowsHaveAtLeastOneDevice(input.windows)) return false;

  if (!commitmentsValid(input.commitments)) return false;
  if (!noOverlappingCommitments(input.commitments)) return false;

  if (!studyGoalValid(input.goal)) return false;
  if (!preferencesWithinLimits(input.routine)) return false;
  if (!crossFieldValidation(input.routine)) return false;

  return true;
}

function studyGoalValid(goal: StudyGoal): boolean {
  if (!goal.title || goal.title.trim().length === 0) return false;
  if (!goal.targetJob || goal.targetJob.trim().length === 0) return false;
  if (!goal.type) return false;
  if (!goal.studyLevel) return false;
  if (!goal.phase) return false;

  if (goal.examDate) return true;
  if (goal.examDateUnknown === true) return true;
  return false;
}

function crossFieldValidation(routine: UserRoutine): boolean {
  if (!routine.planMode) return false;
  if (routine.maxSubjectsPerDay == null) return false;
  if (routine.preferredSessionMinutes == null) return false;
  if (routine.badDayMinimumMinutes == null) return false;
  if (!routine.missedDayStrategy) return false;

  if (routine.wantsDayOff === true && !routine.dayOffPreference) return false;
  if (routine.wantsDayOff === false && routine.dayOffPreference) return false;

  return true;
}
```

Efeito transacional ao concluir:

- `UserRoutine.routineOnboardingCompletedAt = now()`
- `User.onboardingVersion = 1`

## 13) Estratégia de salvamento (rascunho vs envio final)

Decisão (recomendada e aprovada para 1A):

- Permitir rascunho por etapa.
- Validar parcialmente a cada etapa salva.
- Executar validação completa e marcar como concluído somente na confirmação final.
- Persistir progresso para não perder dados se o usuário fechar a página.

Campos opcionais durante rascunho (persistidos como `null` até o usuário preencher):

- `UserRoutine.timezone`
- `UserRoutine.wakeTimeMinute`, `UserRoutine.sleepTimeMinute`
- `UserRoutine.peakEnergyPeriod`, `UserRoutine.habitualFatigueLevel`
- `UserRoutine.preferredSessionMinutes`
- `UserRoutine.planMode`
- `UserRoutine.maxSubjectsPerDay`
- `UserRoutine.badDayMinimumMinutes`
- `UserRoutine.missedDayStrategy`

Regras:

- Endpoints de rascunho aceitam `null` e validam apenas o que foi enviado.
- Somente `/routine/me/complete`:
  - exige todos os campos obrigatórios para conclusão
  - grava `routineOnboardingCompletedAt`
  - grava `User.onboardingVersion = 1`

Alternativa mínima (se houver corte de escopo): enviar tudo no final.

Impacto da alternativa mínima:

- experiência pior (perda de dados em refresh/fechar)
- maior fricção para completar onboarding

## 14) Testes obrigatórios (lista)

- Acesso não autenticado (401)
- Isolamento entre usuários (403/404 conforme política)
- Timezone inválido
- `dateKey` inválido
- Data futura (bloqueada)
- Janela atravessando meia-noite (bloqueada)
- Janela sobreposta (bloqueada)
- Compromisso sobreposto (bloqueado)
- Compromisso parcial (subtração correta + segmentos restantes)
- Compromisso sem interseção (não altera capacidade)
- Dois intervalos de 30 minutos não podem virar um bloco contínuo de 60
- Uma janela de 70 minutos gera `45 + 25` no mesmo intervalo
- Duas janelas de 35 minutos geram `35 + 35`
- Residual inferior a 20 é descartado dentro do respectivo intervalo
- Residual de 20 minutos (vira bloco residual)
- Residual de 19 minutos (descartado com justificativa)
- Check-in reduzindo capacidade (cap aplicado)
- Check-in tentando aumentar capacidade (ignorado + aviso)
- `wantsDayOff=true` exige `dayOffPreference`
- `wantsDayOff=false` exige `dayOffPreference=null`
- Janela sem atividades permitidas (bloqueada)
- Janela sem dispositivos (bloqueada)
- Objetivo inválido: `examDate=null` e `examDateUnknown=false` (bloqueado)
- Rollback transacional no replace (falha no meio e rollback)
- Unique de rotina (1:1 por usuário)
- Unique de objetivo (1:1 por usuário)
- Cascade (User → Routine/Goal/Windows/Commitments/CheckIns)
- Migration em banco vazio (aplica com sucesso)
- Seed executado duas vezes (idempotência)

## 15) Plano de arquivos (criar/modificar/manter intactos)

### Backend (NestJS)

- Criar:
  - `src/routine-engine/config.ts`
  - `src/routine-engine/engine.ts`
  - `src/routine-engine/types.ts`
  - `src/routine-engine/engine.spec.ts`
  - `src/routine/routine.module.ts`
  - `src/routine/routine.controller.ts`
  - `src/routine/routine.service.ts`
  - `src/routine/routine.service.spec.ts`
  - `src/routine/dto/capacity-week.dto.ts`
  - `src/routine/dto/complete-routine-onboarding.dto.ts`
  - `src/routine/dto/replace-availability-windows.dto.ts`
  - `src/routine/dto/replace-commitments.dto.ts`
  - `src/routine/dto/upsert-daily-checkin.dto.ts`
  - `src/routine/dto/upsert-routine-draft.dto.ts`
  - `src/routine/dto/upsert-study-goal.dto.ts`
  - `test/routine.e2e-spec.ts`
  - `scripts/test-db-migrations.ts`
- Modificar:
  - `prisma/schema.prisma`
  - `src/app.module.ts`
  - `src/users/users.controller.ts`
  - `src/users/users.service.ts`
- Manter intactos:
  - `src/planning/*` (não alterar `PlanningService` na 1A)

### Prisma

- Criar (quando autorizado):
  - `prisma/migrations/XXXX_sprint1a_routine_v1/migration.sql`
- Modificar:
  - `prisma/schema.prisma`
- Manter intacto:
  - migrations existentes (não reescrever histórico)

### Web App (Vite/React)

- Criar:
  - `src/app/lib/routineApi.ts`
  - `src/app/lib/routineTypes.ts`
  - `src/app/pages/onboarding/RoutineOnboardingPage.tsx`
  - `src/app/pages/onboarding/steps/AvailabilityStep.tsx`
  - `src/app/pages/onboarding/steps/CommitmentsStep.tsx`
  - `src/app/pages/onboarding/steps/GoalStep.tsx`
  - `src/app/pages/onboarding/steps/PreferencesStep.tsx`
  - `src/app/pages/onboarding/steps/SummaryStep.tsx`
  - `src/app/pages/onboarding/steps/TimezoneStep.tsx`
  - `src/app/components/routine/AllowedActivitiesPicker.tsx`
  - `src/app/components/routine/AvailabilityWindowEditor.tsx`
  - `src/app/components/routine/CapacitySummaryCard.tsx`
  - `src/app/components/routine/DevicesPicker.tsx`
  - `src/app/components/routine/RoutineCommitmentEditor.tsx`
- Modificar:
  - `src/app/pages/Onboarding.tsx`
  - `src/app/components/ProtectedRootLayout.tsx`
  - `src/app/routes.tsx`
- Manter intacto:
  - telas e fluxos fora do onboarding (exceto gates necessários)

### Documentação

- Manter:
  - docs existentes
- Criar:
  - este documento
