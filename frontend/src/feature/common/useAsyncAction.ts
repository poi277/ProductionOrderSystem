"use client";

import { useCallback, useRef, useState } from "react";

export function useAsyncAction() {
  const runningRef = useRef(false);
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(async (action: () => void | Promise<void>) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsPending(true);
    try {
      await action();
    } finally {
      runningRef.current = false;
      setIsPending(false);
    }
  }, []);

  return { isPending, run };
}
