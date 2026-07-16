import type { ProcessStatus } from "./dashboardTypes";

export const PROGRESS_STEPS = [
  "발주서 접수", "생산지시", "조립", "기능검사", "최종검수", "포장", "출하",
] as const;

export const PROGRESS_STATUSES: ProcessStatus[] = [
  "PURCHASESUBMIT", "INSTRUCTION", "ASSEMBLY", "TEST", "FINAL_INSPECTION", "PACKAGING", "SHIPPED",
];

export type ProgressInfo = {
  currentStepIndex: number;
  completedStepIndex: number;
  detailLabel: string;
};

const PROGRESS_BY_STATUS: Record<ProcessStatus, ProgressInfo> = {
  PURCHASESUBMIT: { currentStepIndex: 0, completedStepIndex: 0, detailLabel: "발주서 접수" },
  INSTRUCTION: { currentStepIndex: 1, completedStepIndex: 1, detailLabel: "생산지시" },
  ASSEMBLY: { currentStepIndex: 2, completedStepIndex: 1, detailLabel: "조립" },
  TEST: { currentStepIndex: 3, completedStepIndex: 2, detailLabel: "기능검사" },
  FINAL_INSPECTION: { currentStepIndex: 4, completedStepIndex: 3, detailLabel: "최종검수" },
  PACKAGING: { currentStepIndex: 5, completedStepIndex: 4, detailLabel: "포장" },
  SHIPPED: { currentStepIndex: 6, completedStepIndex: 5, detailLabel: "출하" },
};

export function getProgressInfo(status?: ProcessStatus | null): ProgressInfo {
  if (status && status in PROGRESS_BY_STATUS) return PROGRESS_BY_STATUS[status];
  return { currentStepIndex: 0, completedStepIndex: -1, detailLabel: "발주서 접수" };
}

