import { BadRequestException } from '@nestjs/common';

export function isValidTimezone(timezone: string): boolean {
  const tz = (timezone || '').trim();
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function parseDateKey(dateKey: string): { y: number; m: number; d: number } {
  const v = (dateKey || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new BadRequestException('dateKey inválido.');
  }
  const [y, m, d] = v.split('-').map((p) => Number(p));
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  if (Number.isNaN(dt.getTime())) {
    throw new BadRequestException('dateKey inválido.');
  }
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    throw new BadRequestException('dateKey inválido.');
  }
  return { y, m, d };
}

export function dateKeyToNumber(dateKey: string): number {
  const { y, m, d } = parseDateKey(dateKey);
  return y * 10000 + m * 100 + d;
}

export function todayDateKeyInTimezone(timezone: string): string {
  if (!isValidTimezone(timezone)) {
    throw new BadRequestException('timezone inválido.');
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  if (!y || !m || !d) {
    throw new BadRequestException('Falha ao calcular data atual no timezone.');
  }
  return `${y}-${m}-${d}`;
}

export function assertNotTooFutureDateKey(
  dateKey: string,
  timezone: string,
  maxDaysInFutureAllowed: number,
) {
  const t = parseDateKey(dateKey);
  const todayKey = todayDateKeyInTimezone(timezone);
  const now = parseDateKey(todayKey);
  const targetUtc = Date.UTC(t.y, t.m - 1, t.d, 0, 0, 0);
  const todayUtc = Date.UTC(now.y, now.m - 1, now.d, 0, 0, 0);
  const diffDays = Math.floor((targetUtc - todayUtc) / 86400000);
  if (diffDays <= 0) return;
  if (diffDays > maxDaysInFutureAllowed) {
    throw new BadRequestException('dateKey no futuro não permitido.');
  }
}

export function assertMinuteRange(startMinute: number, endMinute: number) {
  if (!Number.isInteger(startMinute) || !Number.isInteger(endMinute)) {
    throw new BadRequestException('Minutos inválidos.');
  }
  if (startMinute < 0 || startMinute > 1440 || endMinute < 0 || endMinute > 1440) {
    throw new BadRequestException('Minutos fora do intervalo.');
  }
  if (endMinute <= startMinute) {
    throw new BadRequestException('endMinute deve ser maior que startMinute.');
  }
  if (endMinute > 1440) {
    throw new BadRequestException('endMinute inválido.');
  }
}

export function assertNoOverlapByDayOfWeek<T extends { dayOfWeek: string; startMinute: number; endMinute: number }>(
  rows: T[],
) {
  const byDay = new Map<string, T[]>();
  for (const r of rows) {
    const list = byDay.get(r.dayOfWeek) ?? [];
    list.push(r);
    byDay.set(r.dayOfWeek, list);
  }

  for (const [day, list] of byDay.entries()) {
    const sorted = [...list].sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.startMinute < prev.endMinute) {
        throw new BadRequestException(`Sobreposição detectada em ${day}.`);
      }
    }
  }
}
