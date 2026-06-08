import type { ProductStatus } from './types';

// F1 stand-in for Grounded's course.json. Used until the real product repo
// publishes its contract (then GROUNDED_STATUS_URL takes over). Shows a couple
// of modules in different build states so the map/merge logic is exercisable.
export const SAMPLE_PRODUCT: ProductStatus = {
  course: 'atelier',
  hub: 'https://atelier.example.dev',
  modules: {
    M0: {
      status: 'shipped',
      commit: 'a1b2c3d',
      tests: 'pass',
      deployUrl: 'https://grounded-demo.example.dev',
      adrs: ['ADR-001', 'ADR-002'],
      links: { pr: 'https://github.com/diecoscai/grounded/pull/1', files: ['apps/web/app/page.tsx'] },
    },
    M1: {
      status: 'in-progress',
      commit: 'e4f5g6h',
      tests: 'fail',
      links: { files: ['services/api/ingestion/parse.py'] },
    },
  },
};
