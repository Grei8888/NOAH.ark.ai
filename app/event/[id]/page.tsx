import { notFound } from "next/navigation";
import { getPublicEvent } from "@/lib/data";
import { EventDetail } from "@/components/home/EventDetail";
export const dynamic = "force-dynamic";
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) notFound();
  return <EventDetail event={event} />;
}
