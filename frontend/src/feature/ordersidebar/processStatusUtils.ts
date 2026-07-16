import type { ProcessStatus } from "./orderDetailApi";

const PROCESS_STATUSES: readonly ProcessStatus[] = [
  "PURCHASESUBMIT", "INSTRUCTION", "ASSEMBLY", "TEST", "FINAL_INSPECTION",
  "PACKAGING", "SHIPPED", "CANCEL",
];

export const PRODUCT_PROCESS_STEPS = [
  ["생산지시", "INSTRUCTION"], ["조립", "ASSEMBLY"], ["기능검사", "TEST"],
  ["최종검수", "FINAL_INSPECTION"], ["포장", "PACKAGING"],
  ["출하", "SHIPPED"],
] as const satisfies ReadonlyArray<readonly [string, ProcessStatus]>;

export const PRODUCT_PROCESS_LABELS = Object.fromEntries(
  PRODUCT_PROCESS_STEPS.map(([label, status]) => [status, label]),
) as Record<Exclude<ProcessStatus, "PURCHASESUBMIT" | "CANCEL">, string>;

export function displayedProcessStatus(status?: ProcessStatus | null, pendingStatus?: ProcessStatus | null) {
  return pendingStatus ?? status;
}

export function processStatusIndex(status?: ProcessStatus | null) {
  return PRODUCT_PROCESS_STEPS.findIndex(([, value]) => value === status);
}

export function toProcessStatus(value?: string | null): ProcessStatus | null {
  return PROCESS_STATUSES.find((status) => status === value) ?? null;
}

export function processStepState({ currentIndex, disabled, index, stepDisabled }: {
  currentIndex: number; disabled: boolean; index: number; stepDisabled: boolean;
}) {
  return {
    complete: !disabled && !stepDisabled && index < currentIndex,
    current: !disabled && !stepDisabled && index === currentIndex,
  };
}

