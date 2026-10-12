import { NextResponse } from 'next/server';
import { getManualOfficialSourceSnapshot, publicSourceMode } from '@/lib/news/public-official-sources';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Read-only explicit refresh. The upstream two RSS requests are cached/shared
 * by the server for 120s, regardless of repeated button taps. No LLM or DB.
 */
export async function GET() {
  if (!publicSourceMode()) {
    return NextResponse.json({ error: 'Source refresh unavailable' }, {
      status: 404, headers: { 'Cache-Control': 'no-store' },
    });
  }
  const snapshot = await getManualOfficialSourceSnapshot();
  if (snapshot.availableFeeds === 0) {
    return NextResponse.json({ error: 'Official sources currently unreachable' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.json(snapshot, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
