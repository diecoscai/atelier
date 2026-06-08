import { NextResponse } from 'next/server';
import { getProgress } from '@/lib/progress';
import { getProductStatus } from '@/lib/product';

// Live overlay for the (statically rendered) course content: learner progress
// from KV + product build status from Grounded's contract.
export const dynamic = 'force-dynamic';

export async function GET() {
  const [progress, product] = await Promise.all([getProgress(), getProductStatus()]);
  return NextResponse.json({ progress, product });
}
