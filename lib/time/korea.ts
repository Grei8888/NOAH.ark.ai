import { DateTime } from 'luxon';
export const ZONE = 'Asia/Seoul';
export function koreaDate(now = new Date()) { return DateTime.fromJSDate(now, { zone: ZONE }).toISODate()!; }
export function arkPeriod(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new Error('Invalid Ark date');
    const end = DateTime.fromISO(date, { zone: ZONE }).set({ hour: 7 });
    if (!end.isValid || end.toISODate() !== date)
        throw new Error('Invalid Ark date');
    return { from: end.minus({ days: 1 }).toJSDate(), to: end.toJSDate() };
}
export function latestArkDate(now = new Date()) {
    let time = DateTime.fromJSDate(now, { zone: ZONE });
    if (time.hour < 7)
        time = time.minus({ days: 1 });
    while (time.weekday > 5)
        time = time.minus({ days: 1 });
    return time.toISODate()!;
}
export function isDailySlot(now = new Date()) {
    const kst = DateTime.fromJSDate(now, { zone: ZONE });
    return kst.weekday <= 5 && kst.hour === 7;
}
export function formatKorea(date: Date | string) {
    return DateTime.fromJSDate(new Date(date), { zone: ZONE }).toFormat('yyyy.MM.dd HH:mm');
}
