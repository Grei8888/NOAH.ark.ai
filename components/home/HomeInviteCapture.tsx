"use client";

import { useEffect } from "react";
import { readBetaInvitation } from "@/lib/news/beta-invitation";

/**
 * Capture the fragment on the Home landing screen before the visitor navigates
 * to News. The secret never enters the request URL, search params, or logs.
 * Authentication is still checked server-side for each AI request.
 */
export function HomeInviteCapture() {
  useEffect(() => {
    readBetaInvitation();
  }, []);
  return null;
}
