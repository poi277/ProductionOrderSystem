import { formatKoreanDateTime, formatTime } from "../common/dateFormat";
import { getProgressInfo, PROGRESS_STATUSES, PROGRESS_STEPS } from "./progressStatus";
import type { ProcessStatus } from "./dashboardTypes";

type StepProgressProps = {
  compact?: boolean;
  processCompletedTimes?: Partial<Record<ProcessStatus, string>>;
  status?: ProcessStatus | null;
};

export default function StepProgress({ compact = false, processCompletedTimes = {}, status }: StepProgressProps) {
  const progress = getProgressInfo(status);

  return (
    <div className="w-full" aria-label={`현재 진행 상태: ${progress.detailLabel}`}>
      <ol className="grid grid-cols-7 items-start">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = index <= progress.currentStepIndex;
          const completedTime = index <= progress.currentStepIndex
            ? processCompletedTimes[PROGRESS_STATUSES[index]]
            : undefined;
          return (
            <li className="relative flex h-12 min-w-0 items-center justify-center" key={step}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${
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
              <span
                className="absolute bottom-0 whitespace-nowrap text-[10px] font-semibold leading-none text-slate-500"
                title={completedTime ? formatKoreanDateTime(completedTime) : undefined}
              >
                {completedTime ? formatTime(completedTime) : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
