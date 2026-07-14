import type { ProcessStatus } from "./dashboardTypes";

export const PROGRESS_STEPS = ["발주서 접수", "생산지시", "생산중", "검사중", "포장", "납품대기"] as const;

export type ProgressInfo = {
  currentStepIndex: number;
  completedStepIndex: number;
  detailLabel: string;
};

const PROGRESS_BY_STATUS: Record<ProcessStatus, ProgressInfo> = {
  PURCHASESUBMIT: { currentStepIndex: 0, completedStepIndex: 0, detailLabel: "발주서 접수" },
  INSTRUCTION: { currentStepIndex: 1, completedStepIndex: 1, detailLabel: "생산지시 완료" },
  ASSEMBLY: { currentStepIndex: 2, completedStepIndex: 1, detailLabel: "생산중" },
  TEST: { currentStepIndex: 3, completedStepIndex: 2, detailLabel: "기능검사 진행 중" },
  FINAL_INSPECTION: { currentStepIndex: 3, completedStepIndex: 2, detailLabel: "출하검사 진행 중" },
  PACKAGING: { currentStepIndex: 4, completedStepIndex: 3, detailLabel: "포장 진행 중" },
  WAITING_FOR_SHIPMENT: { currentStepIndex: 5, completedStepIndex: 4, detailLabel: "납품대기" },
};

export function getProgressInfo(status?: ProcessStatus | null): ProgressInfo {
  if (status && status in PROGRESS_BY_STATUS) {
    return PROGRESS_BY_STATUS[status];
  }

  return { currentStepIndex: 0, completedStepIndex: -1, detailLabel: "발주서 접수" };
}
