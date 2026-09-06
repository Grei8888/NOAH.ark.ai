import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
export function secretMatches(actual: string | null | undefined, expected: string | undefined) {
    if (!actual || !expected || expected.length < 24)
        return false;
    const a = Buffer.from(actual);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}
function sign(exp: string) { return createHmac('sha256', process.env.ADMIN_SECRET ?? '').update(`noah-admin:${exp}`).digest('hex'); }
export function sessionToken(now = Date.now()) { const exp = String(now + 8 * 3600000); return `${exp}.${sign(exp)}`; }
export function validSession(token: string | undefined, now = Date.now()) {
    if (!process.env.ADMIN_SECRET || process.env.ADMIN_SECRET.length < 24 || !token)
        return false;
    const [exp, signature] = token.split('.');
    return /^\d+$/.test(exp) && Number(exp) > now && Number(exp) <= now + 8 * 3600000 && secretMatches(signature, sign(exp));
}
export async function isAdmin() { return validSession((await cookies()).get('noah-admin')?.value); }
export function validOrigin(request: Request) {
    const origin = request.headers.get('origin');
    return !!origin && origin === new URL(process.env.APP_URL ?? 'http://localhost:3000').origin;
}
