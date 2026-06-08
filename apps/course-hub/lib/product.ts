import { z } from 'zod';
import type { ProductStatus } from './types';
import { SAMPLE_PRODUCT } from './sample-product';

// Single point of coupling to the Grounded product repo. The hub depends ONLY
// on this contract (course.json), never on Grounded's internal layout.
const productModuleSchema = z.object({
  status: z.enum(['shipped', 'in-progress', 'todo']),
  commit: z.string().optional(),
  tests: z.enum(['pass', 'fail']).optional(),
  deployUrl: z.string().url().optional(),
  evalResults: z.string().optional(),
  adrs: z.array(z.string()).optional(),
  links: z
    .object({ pr: z.string().url().optional(), files: z.array(z.string()).optional() })
    .optional(),
});

export const productStatusSchema = z.object({
  course: z.string(),
  hub: z.string().optional(),
  modules: z.record(z.string(), productModuleSchema),
});

// Raw URL of Grounded's course.json (e.g. a GitHub raw link). When unset,
// F1 falls back to the bundled sample so the hub runs standalone.
const STATUS_URL = process.env.GROUNDED_STATUS_URL;
const GITHUB_TOKEN = process.env.GROUNDED_GITHUB_TOKEN;

export function parseProductStatus(input: unknown): ProductStatus {
  return productStatusSchema.parse(input);
}

export async function getProductStatus(): Promise<ProductStatus> {
  if (!STATUS_URL) return SAMPLE_PRODUCT;
  const res = await fetch(STATUS_URL, {
    headers: GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : undefined,
    // The Vercel Deploy Hook rebuilds on product push; revalidate as a safety net.
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Grounded status fetch failed: ${res.status}`);
  return parseProductStatus(await res.json());
}
