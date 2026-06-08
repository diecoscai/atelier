import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProgress, setGate, saveDrillVerdict } from '@/lib/progress';

export const dynamic = 'force-dynamic';

// Simple single-user guard. If ATELIER_WRITE_KEY is set, writes require a
// matching x-atelier-key header. Unset (local dev) → writes allowed.
function authorized(req: NextRequest): boolean {
  const key = process.env.ATELIER_WRITE_KEY;
  if (!key) return true;
  return req.headers.get('x-atelier-key') === key;
}

export async function GET() {
  return NextResponse.json({ progress: await getProgress() });
}

const bodySchema = z.union([
  z.object({ action: z.literal('gate'), moduleId: z.string(), gate: z.enum(['passed', 'pending']) }),
  z.object({ action: z.literal('drill'), moduleId: z.string(), verdict: z.string(), note: z.string().optional() }),
]);

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad request', issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;
  const result =
    data.action === 'gate'
      ? await setGate(data.moduleId, data.gate)
      : await saveDrillVerdict(data.moduleId, data.verdict, data.note);
  return NextResponse.json({ ok: true, module: result });
}
