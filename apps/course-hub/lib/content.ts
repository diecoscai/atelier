import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ModuleContent, ModuleParsedDoc } from './types';

// Course content is co-located with the hub at content/chapters/<slug>/ so a
// standalone deploy of this app includes it. Reads happen at BUILD time (static
// server components), so no runtime filesystem access is needed on Vercel.
const CHAPTERS_DIR = path.join(process.cwd(), 'content', 'chapters');

const FILE_MAP = {
  leccion: 'leccion.md',
  materialApoyo: 'material-apoyo.md',
  practica: 'practica.md',
  criteriosDefensa: 'criterios-defensa.md',
  pruebas: 'pruebas.md',
} as const;

function readDoc(slug: string, file: string): ModuleParsedDoc | undefined {
  const full = path.join(CHAPTERS_DIR, slug, file);
  if (!fs.existsSync(full)) return undefined;
  const raw = fs.readFileSync(full, 'utf8');
  const { data, content } = matter(raw);
  return { frontmatter: data, body: content };
}

export function getModuleContent(slug: string): ModuleContent {
  const out: ModuleContent = {};
  for (const [key, file] of Object.entries(FILE_MAP)) {
    const doc = readDoc(slug, file);
    if (doc) out[key as keyof ModuleContent] = doc;
  }
  return out;
}

export function hasChapter(slug: string): boolean {
  return fs.existsSync(path.join(CHAPTERS_DIR, slug));
}
