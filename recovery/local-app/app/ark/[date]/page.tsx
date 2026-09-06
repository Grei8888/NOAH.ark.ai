import { notFound } from 'next/navigation';
import { getArk } from '@/lib/data';
import ArkReport from '@/components/ArkReport';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: {
    params: Promise<{
        date: string;
    }>;
}) { const { date } = await params; return { title: `${date} Today’s Ark`, openGraph: { title: `${date} Today’s Ark · NOAH`, description: '지난 24시간 반드시 알아야 할 변화', url: `/ark/${date}` } }; }
export default async function ArkPage({ params }: {
    params: Promise<{
        date: string;
    }>;
}) { const { date } = await params; if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    notFound(); const ark = await getArk(date); if (!ark)
    notFound(); return <ArkReport ark={ark}/>; }
