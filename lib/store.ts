// lib/store.ts
import { kv as vercelKv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

/** Use Vercel KV if env vars exist; otherwise JSON file store in dev */
const hasKv =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const DEV_DIR = path.join(process.cwd(), ".devdata");
const DEV_FILE = path.join(DEV_DIR, "store.json");

async function ensureFile(): Promise<void> {
  await fs.mkdir(DEV_DIR, { recursive: true });
  try {
    await fs.access(DEV_FILE);
  } catch {
    await fs.writeFile(DEV_FILE, "{}");
  }
}

async function readAll(): Promise<Record<string, unknown>> {
  await ensureFile();
  try {
    const txt = await fs.readFile(DEV_FILE, "utf-8");
    return txt ? (JSON.parse(txt) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function writeAll(obj: Record<string, unknown>): Promise<void> {
  await ensureFile();
  await fs.writeFile(DEV_FILE, JSON.stringify(obj));
}

export const store = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (hasKv) return (await vercelKv.get<T>(key)) ?? null;
    const all = await readAll();
    return (key in all ? (all[key] as T) : null);
  },
  async set<T = unknown>(key: string, val: T): Promise<void> {
    if (hasKv) {
      await vercelKv.set<T>(key, val as T);
      return;
    }
    const all = await readAll();
    all[key] = val as unknown;
    await writeAll(all);
  },
};
