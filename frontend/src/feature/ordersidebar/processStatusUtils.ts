import type { ProcessStatus } from "./orderDetailApi";

const PROCESS_STATUSES: readonly ProcessStatus[] = [
  "PURCHASESUBMIT",
  "INSTRUCTION",
  "ASSEMBLY",
  "TEST",
  "FINAL_INSPECTION",
  "PACKAGING",
  "WAITING_FOR_SHIPMENT",
];

export const PRODUCT_PROCESS_STEPS = [
  ["생산지시", "INSTRUCTION"], ["생산중", "ASSEMBLY"], ["기능검사", "TEST"],
  ["출하검사", "FINAL_INSPECTION"], ["포장", "PACKAGING"], ["납품대기", "WAITING_FOR_SHIPMENT"],
] as const satisfies ReadonlyArray<readonly [string, ProcessStatus]>;

export function displayedProcessStatus(
  status?: ProcessStatus | null,
  pendingStatus?: ProcessStatus | null,
) {
  return pendingStatus ?? status;
}

export function processStatusIndex(status?: ProcessStatus | null) {
  return PRODUCT_PROCESS_STEPS.findIndex(([, value]) => value === status);
}

export function toProcessStatus(value?: string | null): ProcessStatus | null {
  return PROCESS_STATUSES.find((status) => status === value) ?? null;
}

export function processStepState({
  currentIndex,
  disabled,
  index,
  stepDisabled,
}: {
  currentIndex: number;
  disabled: boolean;
  index: number;
  stepDisabled: boolean;
}) {
  return {
    complete: !disabled && !stepDisabled && index < currentIndex,
    current: !disabled && !stepDisabled && index === currentIndex,
  };
}
