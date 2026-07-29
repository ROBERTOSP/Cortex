import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export function Analytics() {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const weeklyStudy = [
    { day: "Seg", horas: 3.5, meta: 3 },
    { day: "Ter", horas: 4.0, meta: 3 },
    { day: "Qua", horas: 2.5, meta: 3 },
    { day: "Qui", horas: 4.5, meta: 3 },
    { day: "Sex", horas: 1.5, meta: 3 },
    { day: "Sab", horas: 5.0, meta: 3 },
    { day: "Dom", horas: 0, meta: 3 },
  ];

  const monthlyStudy = [
    { week: "Sem 1", horas: 18, revisoes: 12 },
    { week: "Sem 2", horas: 22, revisoes: 15 },
    { week: "Sem 3", horas: 16, revisoes: 10 },
    { week: "Sem 4", horas: 25, revisoes: 18 },
  ];

  const accuracy = [
    { date: "28/05", acertos: 62, erros: 38 },
    { date: "29/05", acertos: 70, erros: 30 },
    { date: "30/05", acertos: 65, erros: 35 },
    { date: "31/05", acertos: 78, erros: 22 },
    { date: "01/06", acertos: 72, erros: 28 },
    { date: "02/06", acertos: 80, erros: 20 },
    { date: "03/06", acertos: 83, erros: 17 },
  ];

  const subjects = [
    {
      name: "Direito Constitucional",
      dominio: 78,
      revisoes: 24,
      questoes: 180,
      acerto: 74,
    },
    {
      name: "Portugues",
      dominio: 85,
      revisoes: 18,
      questoes: 220,
      acerto: 82,
    },
    {
      name: "Raciocinio Logico",
      dominio: 63,
      revisoes: 12,
      questoes: 150,
      acerto: 61,
    },
    {
      name: "Administracao Publica",
      dominio: 71,
      revisoes: 20,
      questoes: 130,
      acerto: 68,
    },
    {
      name: "Informatica",
      dominio: 55,
      revisoes: 8,
      questoes: 90,
      acerto: 54,
    },
  ];

  const kpis = [
    {
      label: "Horas esta semana",
      value: "21h",
      icon: <Clock className="w-5 h-5" />,
      trend: "+12%",
      up: true,
    },
    {
      label: "Questoes respondidas",
      value: "347",
      icon: <Target className="w-5 h-5" />,
      trend: "+8%",
      up: true,
    },
    {
      label: "Taxa de acerto",
      value: "73%",
      icon: <BarChart2 className="w-5 h-5" />,
      trend: "+5pts",
      up: true,
    },
    {
      label: "Revisoes concluidas",
      value: "82",
      icon: <TrendingUp className="w-5 h-5" />,
      trend: "-3%",
      up: false,
    },
  ];

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: string | number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload?.length) {
      return null;
    }
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((item) => (
          <p key={item.name} style={{ color: item.color }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 xl:px-10">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="mb-0.5">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Semana de 02 a 08 de junho
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {(["week", "month"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === value
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {value === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-3xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-primary">{kpi.icon}</div>
              <Badge
                variant="secondary"
                className={`text-xs gap-0.5 ${
                  kpi.up
                    ? "text-foreground bg-muted"
                    : "text-destructive bg-destructive/10"
                }`}
              >
                {kpi.up ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {kpi.trend}
              </Badge>
            </div>
            <p className="text-2xl font-semibold mb-0.5">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-3xl border border-border p-5">
          <h3 className="mb-1">Horas de estudo</h3>
          <p className="text-xs text-muted-foreground mb-5">Comparativo com meta diaria de 3h</p>
          <ResponsiveContainer width="100%" height={220}>
            {period === "week" ? (
              <BarChart data={weeklyStudy} barSize={20} barGap={4}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                <Bar dataKey="meta" name="Meta" fill="var(--muted)" radius={6} />
                <Bar dataKey="horas" name="Horas" fill="var(--primary)" radius={6} />
              </BarChart>
            ) : (
              <BarChart data={monthlyStudy} barSize={24}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                <Bar dataKey="horas" name="Horas" fill="var(--primary)" radius={6} />
                <Bar dataKey="revisoes" name="Revisoes" fill="var(--chart-2)" radius={6} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-3xl border border-border p-5">
          <h3 className="mb-1">Acertos vs. Erros</h3>
          <p className="text-xs text-muted-foreground mb-5">Ultimos 7 dias</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={accuracy}>
              <defs>
                <linearGradient id="cortex-acertos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cortex-erros" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="acertos"
                name="Acertos %"
                stroke="var(--foreground)"
                fill="url(#cortex-acertos)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="erros"
                name="Erros %"
                stroke="var(--destructive)"
                fill="url(#cortex-erros)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="mb-0">Por materia</h3>
          <Badge variant="secondary">{subjects.length} materias</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Materia", "Dominio", "Revisoes", "Questoes", "Acerto"].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-5 py-3 text-xs font-medium text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr
                  key={subject.name}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium">{subject.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Progress value={subject.dominio} className="w-20 h-1.5" />
                      <span className="text-xs text-muted-foreground">{subject.dominio}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{subject.revisoes}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{subject.questoes}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant="secondary"
                      className={
                        subject.acerto >= 75
                          ? "bg-muted text-foreground"
                          : subject.acerto >= 60
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {subject.acerto}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
