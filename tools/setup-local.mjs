import { existsSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();

const requiredKeysByName = {
  "Backend env": ["DATABASE_URL", "JWT_SECRET"],
  "Web env": ["VITE_API_URL", "VITE_GOOGLE_CLIENT_ID"],
};

const steps = [
  {
    name: "Backend env",
    from: join(root, "Cortex Extensão", "backend", ".env.example"),
    to: join(root, "Cortex Extensão", "backend", ".env"),
  },
  {
    name: "Web env",
    from: join(root, "layout", ".env.example"),
    to: join(root, "layout", ".env.local"),
  },
];

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyIfMissing(from, to) {
  if (!existsSync(from)) {
    throw new Error(`Arquivo não encontrado: ${from}`);
  }

  if (existsSync(to)) {
    return { copied: false };
  }

  ensureDir(to);
  copyFileSync(from, to);
  return { copied: true };
}

function findEmptyAssignments(filePath) {
  const text = readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/);
  const entries = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    entries[key] = value;
  }

  return entries;
}

for (const step of steps) {
  const result = copyIfMissing(step.from, step.to);
  const entries = findEmptyAssignments(step.to);
  const required = requiredKeysByName[step.name] ?? [];
  const missingRequired = required.filter((k) => !entries[k]);

  const status = result.copied ? "criado" : "já existia";
  process.stdout.write(`- ${step.name}: ${status} (${step.to})\n`);
  if (missingRequired.length) {
    process.stdout.write(`  - Obrigatório preencher: ${missingRequired.join(", ")}\n`);
  }
}

process.stdout.write("\nPróximos comandos:\n");
process.stdout.write("- npm install\n");
process.stdout.write("- npm run dev:backend\n");
process.stdout.write("- npm run dev:web\n");
