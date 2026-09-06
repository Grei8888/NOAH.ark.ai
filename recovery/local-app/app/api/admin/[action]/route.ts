import { NextResponse } from 'next/server';
import { isAdmin, validOrigin } from '@/lib/auth';
import { runPipeline, PipelineBusyError, type PipelineType } from '@/lib/pipeline';
export const maxDuration = 300;
export async function POST(request: Request, { params }: {
    params: Promise<{
        action: string;
    }>;
}) {
    if (!validOrigin(request) || !await isAdmin())
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { action } = await params;
    if (!['collect', 'process', 'generate-ark', 'full'].includes(action))
        return NextResponse.json({ error: 'Unknown action' }, { status: 404 });
    try {
        return NextResponse.json(await runPipeline(action as PipelineType), { headers: { 'Cache-Control': 'no-store' } });
    }
    catch (e) {
        return NextResponse.json({ error: e instanceof PipelineBusyError ? '다른 파이프라인이 실행 중입니다.' : '실행 실패: 관리자 로그를 확인하세요.' }, { status: e instanceof PipelineBusyError ? 409 : 500 });
    }
}
