'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function AdminControls() {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    async function run(mode: string) { setBusy(true); setMessage('파이프라인을 실행하고 있습니다…'); try {
        const response = await fetch(`/api/admin/${mode}`, { method: 'POST' });
        const result = await response.json();
        setMessage(response.ok ? `완료 · ${result.status} · 저장 ${result.articlesInserted}건 / 새 Event ${result.eventsCreated}개` : result.error ?? '실행 실패');
        router.refresh();
    }
    catch {
        setMessage('연결이 종료되었습니다. 실행 기록을 확인한 후 다시 시도하세요.');
    }
    finally {
        setBusy(false);
    } }
    return <div className="controls"><div>{[['collect', 'Collect'], ['process', 'Process'], ['generate-ark', 'Generate Ark'], ['full', 'Run Full Pipeline']].map(([mode, label]) => <button key={mode} className={mode === 'full' ? '' : 'secondary'} onClick={() => run(mode)} disabled={busy}>{label}</button>)}</div><p aria-live="polite" role="status">{message || '최근 평일 07:00 기준으로 실행합니다. 공개된 Ark는 재실행해도 보존됩니다.'}</p></div>;
}
