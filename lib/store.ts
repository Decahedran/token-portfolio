// lib/store.ts
import { kv as vercelKv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

/**
 * Uses Vercel KV in prod (if env vars exist).
 * Falls back to a file-backed JSON store locally so routes share state.
 */
const hasKv =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const DEV_DIR = path.join(process.cwd(), ".devdata");
const DEV_FILE = path.join(DEV_DIR, "store.json");

async function ensureFile() {
  try {
    await fs.mkdir(DEV_DIR, { recursive: true });
    try { await fs.access(DEV_FILE); }
    catch { await fs.writeFile(DEV_FILE, "{}"); }
  } catch { /* ignore */ }
}

async function readAll(): Promise<Record<string, any>> {
  await ensureFile();
  try {
    const txt = await fs.readFile(DEV_FILE, "utf-8");
    return txt ? JSON.parse(txt) : {};
  } catch {
    return {};
  }
}

async function writeAll(obj: Record<string, any>) {
  await ensureFile();
  await fs.writeFile(DEV_FILE, JSON.stringify(obj));
}

export const store = {
  async get<T = any>(key: string): Promise<T | null> {
    if (hasKv) return await vercelKv.get<T>(key);
    const all = await readAll();
    return (key in all ? (all[key] as T) : null);
  },
  async set<T = any>(key: string, val: T): Promise<void> {
    if (hasKv) { await vercelKv.set<T>(key, val as any); return; }
    const all = await readAll();
    all[key] = val;
    await writeAll(all);
  }
};
