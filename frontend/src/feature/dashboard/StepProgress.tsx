import { getProgressInfo, PROGRESS_STEPS } from "./progressStatus";
import type { ProcessStatus } from "./dashboardTypes";

type StepProgressProps = {
  compact?: boolean;
  status?: ProcessStatus | null;
};

export default function StepProgress({ compact = false, status }: StepProgressProps) {
  const progress = getProgressInfo(status);

  return (
    <div className={compact ? "min-w-[340px]" : "min-w-[700px]"} aria-label={`현재 진행 상태: ${progress.detailLabel}`}>
      <ol className="flex items-center">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = index <= progress.currentStepIndex;
          return (
            <li className="relative flex min-w-0 flex-1 flex-col items-center" key={step}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 ${compact ? "top-[7px]" : "top-[9px]"} h-0.5 w-full ${
                    index - 1 < progress.currentStepIndex ? "bg-blue-400" : "bg-slate-200"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex ${compact ? "size-4" : "size-5"} items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isCompleted && <span className="size-1.5 rounded-full bg-white" />}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
