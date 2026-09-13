"use client";

import { useEffect, useState } from "react";

/** True only after the first client paint — safe to use browser-only providers/hooks. */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
