import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import { Client } from 'pg';
import { URL } from 'node:url';

function die(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function requireEnv(name: string): string {
  const v = (process.env[name] || '').trim();
  if (!v) die(`${name} não configurada.`);
  return v;
}

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeUrl(raw: string): string {
  const v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) return v.slice(1, -1);
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1);
  return v;
}

function getBin(name: string): string {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

function run(
  command: string,
  args: string[],
  env: Record<string, string | undefined>,
): void {
  const res = spawnSync(getBin(command), args, {
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

async function main() {
  if (process.env.NODE_ENV !== 'test') {
    die('NODE_ENV precisa ser "test" para executar este script.');
  }

  const adminUrl = normalizeUrl(requireEnv('TEST_DATABASE_URL_ADMIN'));
  const dbNamePrefix = (requireEnv('TEST_DATABASE_NAME_PREFIX') || '').trim();

  if (!dbNamePrefix.startsWith('test_')) {
    die('TEST_DATABASE_NAME_PREFIX deve começar com "test_".');
  }

  const forbiddenHosts = parseCsv(process.env.TEST_DATABASE_FORBIDDEN_HOSTS || '');
  const allowedHosts = parseCsv(requireEnv('TEST_DATABASE_ALLOWED_HOSTS'));

  const databaseUrl = normalizeUrl(process.env.DATABASE_URL || '');
  if (!databaseUrl) die('DATABASE_URL deve existir, mas não pode ser usada no teste.');
  if (databaseUrl === adminUrl) {
    die('TEST_DATABASE_URL_ADMIN deve ser diferente de DATABASE_URL.');
  }

  const u = new URL(adminUrl);
  const host = (u.hostname || '').toLowerCase();

  if (!allowedHosts.map((h) => h.toLowerCase()).includes(host)) {
    die('Host do TEST_DATABASE_URL_ADMIN não está na allowlist (TEST_DATABASE_ALLOWED_HOSTS).');
  }

  if (forbiddenHosts.map((h) => h.toLowerCase()).includes(host)) {
    die('Host do TEST_DATABASE_URL_ADMIN está na blocklist (TEST_DATABASE_FORBIDDEN_HOSTS).');
  }

  const testDbName = `${dbNamePrefix}${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  const adminClient = new Client({ connectionString: adminUrl });
  await adminClient.connect();

  let created = false;

  try {
    await adminClient.query(`CREATE DATABASE "${testDbName}"`);
    created = true;

    const testDbUrl = new URL(adminUrl);
    testDbUrl.pathname = `/${testDbName}`;
    testDbUrl.searchParams.set('schema', 'public');

    const shadowDbUrl = new URL(adminUrl);
    shadowDbUrl.pathname = `/${testDbName}`;
    shadowDbUrl.searchParams.set('schema', '_prisma_shadow_test');

    const envOverride = {
      DATABASE_URL: testDbUrl.toString(),
      PRISMA_MIGRATE_DATABASE_URL: testDbUrl.toString(),
      SHADOW_DATABASE_URL: shadowDbUrl.toString(),
    };

    run('npx', ['prisma', 'generate'], envOverride);
    run('npx', ['prisma', 'migrate', 'deploy'], envOverride);

    run('npm', ['run', 'prisma:seed'], envOverride);
    run('npm', ['run', 'prisma:seed'], envOverride);
  } finally {
    try {
      if (created) {
        await adminClient.query(`DROP DATABASE IF EXISTS "${testDbName}" WITH (FORCE)`);
      }
    } finally {
      await adminClient.end();
    }
  }
}

main().catch((e) => {
  process.stderr.write(`Erro: ${e?.message || e}\n`);
  process.exit(1);
});
