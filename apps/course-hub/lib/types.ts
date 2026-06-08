export type Track = 'core' | 'extended' | 'sidequest' | 'dsa';

export interface ModuleDef {
  id: string; // 'M0', 'M4', 'SQ-A', 'DSA'
  slug: string; // chapter dir name, e.g. 'M0-setup'
  track: Track;
  title: string;
  tagline: string;
  checkpoint?: boolean; // M4 hireable checkpoint
  spine?: boolean; // M2 evals spine
}

export type BuildStatus = 'shipped' | 'in-progress' | 'todo';
export type GateStatus = 'passed' | 'pending';

// Mirror of the cross-repo contract (Grounded's course.json)
export interface ProductModule {
  status: BuildStatus;
  commit?: string;
  tests?: 'pass' | 'fail';
  deployUrl?: string;
  evalResults?: string;
  adrs?: string[];
  links?: { pr?: string; files?: string[] };
}

export interface ProductStatus {
  course: string;
  hub?: string;
  modules: Record<string, ProductModule>;
}

export interface ModuleProgress {
  gate: GateStatus;
  drillVerdicts?: { at: string; verdict: string; note?: string }[];
  updatedAt?: string;
}

export type ProgressMap = Record<string, ModuleProgress>;

// What the map needs per module: static def + content presence + live overlays
export interface ModuleParsedDoc {
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ModuleContent {
  leccion?: ModuleParsedDoc;
  practica?: ModuleParsedDoc;
  criteriosDefensa?: ModuleParsedDoc;
  pruebas?: ModuleParsedDoc;
}
