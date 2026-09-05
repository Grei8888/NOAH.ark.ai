import { mockEvents } from "@/lib/domain/mock-events";
import { selectArkEvents } from "./select-ark";

export function getTodaysArk() {
  return selectArkEvents(mockEvents);
}
