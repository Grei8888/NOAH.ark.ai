import { getArk } from '@/lib/data';
import ArkReport from '@/components/ArkReport';
export const dynamic = 'force-dynamic';
export default async function Home() { const ark = await getArk(); return ark ? <ArkReport ark={ark}/> : <main id="main" className="empty"><p className="eyebrow">ONLY WHAT MATTERS.</p><h1>Today’s Ark.</h1><p>첫 번째 Ark를 준비하고 있습니다.</p></main>; }
