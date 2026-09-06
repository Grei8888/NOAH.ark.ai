import { NextResponse } from 'next/server';
import { secretMatches, sessionToken, validOrigin } from '@/lib/auth';
export async function POST(request: Request) {
    if (!validOrigin(request))
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    const body = await request.formData();
    const response = NextResponse.redirect(new URL('/admin', process.env.APP_URL ?? 'http://localhost:3000'), 303);
    if (body.get('logout')) {
        response.cookies.delete('noah-admin');
        return response;
    }
    if (!secretMatches(String(body.get('secret') ?? ''), process.env.ADMIN_SECRET))
        return NextResponse.json({ error: '로그인 실패: 관리자 키를 확인하세요.' }, { status: 401 });
    response.cookies.set('noah-admin', sessionToken(), { httpOnly: true, secure: new URL(process.env.APP_URL ?? 'http://localhost:3000').protocol === 'https:', sameSite: 'strict', maxAge: 8 * 3600, path: '/' });
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
