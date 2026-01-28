"use client";

import { useState, useEffect } from "react";

function getInitialOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(getInitialOnline);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-100"
    >
      You&apos;re offline. Some actions may be unavailable.
    </div>
  );
}
