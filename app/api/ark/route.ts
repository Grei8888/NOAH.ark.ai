import { NextResponse } from 'next/server';
import { getEdition } from '@/lib/data';
export const dynamic = 'force-dynamic';
export async function GET() {
 try { return NextResponse.json({ service: 'NOAH ARK', ...await getEdition() }, { headers: { 'Cache-Control': 'no-store' } }); }
 catch { return NextResponse.json({ error: 'Edition unavailable; no demo fallback was used.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
