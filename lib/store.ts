// lib/store.ts
import { kv as vercelKv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

export interface KVLike {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, val: T): Promise<void>;
}

const hasKv =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const isVercel = !!process.env.VERCEL; // true on Vercel prod/preview

// -------- In-memory store (safe fallback for Vercel without KV) --------
function createMemStore(): KVLike {
  const g = globalThis as unknown as { __MEMSTORE__?: Map<string, unknown> };
  if (!g.__MEMSTORE__) g.__MEMSTORE__ = new Map<string, unknown>();
  const mem = g.__MEMSTORE__;
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      return mem.has(key) ? (mem.get(key) as T) : null;
    },
    async set<T = unknown>(key: string, val: T): Promise<void> {
      mem.set(key, val as unknown);
    },
  };
}

// -------- File-backed store (dev only) --------
const DEV_DIR = path.join(process.cwd(), ".devdata");
const DEV_FILE = path.join(DEV_DIR, "store.json");

async function ensureFile(): Promise<boolean> {
  try {
    await fs.mkdir(DEV_DIR, { recursive: true });
    try { await fs.access(DEV_FILE); }
    catch { await fs.writeFile(DEV_FILE, "{}"); }
    return true;
  } catch {
    return false; // read-only FS (e.g. Vercel) -> not usable
  }
}

async function readAll(): Promise<Record<string, unknown>> {
  const ok = await ensureFile();
  if (!ok) return {};
  try {
    const txt = await fs.readFile(DEV_FILE, "utf-8");
    return txt ? (JSON.parse(txt) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function writeAll(obj: Record<string, unknown>): Promise<void> {
  const ok = await ensureFile();
  if (!ok) return; // silently ignore if FS not writable
  await fs.writeFile(DEV_FILE, JSON.stringify(obj));
}

function createFileStore(): KVLike {
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      const all = await readAll();
      return (key in all ? (all[key] as T) : null);
    },
    async set<T = unknown>(key: string, val: T): Promise<void> {
      const all = await readAll();
      all[key] = val as unknown;
      await writeAll(all);
    },
  };
}

// -------- Vercel KV wrapper --------
function createVercelStore(): KVLike {
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      return (await vercelKv.get<T>(key)) ?? null;
    },
    async set<T = unknown>(key: string, val: T): Promise<void> {
      await vercelKv.set<T>(key, val as T);
    },
  };
}

// -------- Select implementation --------
// 1) If KV env exists → use KV (persistent)
// 2) Else if running on Vercel → use in-memory (no crashes, ephemeral)
// 3) Else (local dev) → use file store in .devdata/
export const store: KVLike = hasKv
  ? createVercelStore()
  : isVercel
  ? createMemStore()
  : createFileStore();
