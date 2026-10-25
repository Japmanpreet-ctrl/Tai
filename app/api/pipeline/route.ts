import { runClosedLoopPipeline } from '@/lib/services/repair-agent';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({ prompt: z.string().trim().min(8).max(2000) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Enter a prompt of at least 8 characters.' }, { status: 400 });
  return NextResponse.json(await runClosedLoopPipeline(parsed.data.prompt));
}
