import { NextResponse } from 'next/server';
import { secretMatches } from '@/lib/auth';
import { runPipeline, PipelineBusyError } from '@/lib/pipeline';
import { isDailySlot, koreaDate } from '@/lib/time/korea';
export const maxDuration = 300;
export async function GET(request: Request, { params }: {
    params: Promise<{
        type: string;
    }>;
}) {
    if (!secretMatches(request.headers.get('authorization'), process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined) || !process.env.CRON_SECRET || process.env.CRON_SECRET.length < 24)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { type } = await params;
    if (!['daily', 'breaking'].includes(type))
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const now = new Date();
    if (type === 'daily' && !isDailySlot(now))
        return NextResponse.json({ status: 'SKIPPED', reason: 'Outside weekday 07:00 KST slot' });
    try {
        return NextResponse.json(await runPipeline(type === 'daily' ? 'full' : 'breaking', koreaDate(now), now), { headers: { 'Cache-Control': 'no-store' } });
    }
    catch (e) {
        return NextResponse.json({ error: e instanceof PipelineBusyError ? 'Pipeline busy' : 'Pipeline failed' }, { status: e instanceof PipelineBusyError ? 409 : 500 });
    }
}
