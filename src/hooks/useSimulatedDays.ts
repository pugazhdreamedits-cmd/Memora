import { useState, useCallback } from "react";
import { SimStore } from "@/lib/storage";

export function useSimulatedDays() {
  const [offset, setOffset] = useState(SimStore.getOffset());

  const addDays = useCallback((days: number) => {
    SimStore.addDays(days);
    setOffset(SimStore.getOffset());
  }, []);

  const reset = useCallback(() => {
    SimStore.setOffset(0);
    setOffset(0);
  }, []);

  const currentDate = SimStore.getCurrentDate();

  return { offset, addDays, reset, currentDate };
}
