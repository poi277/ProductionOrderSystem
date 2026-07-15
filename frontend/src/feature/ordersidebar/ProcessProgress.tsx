import ProcessStep from "./ProcessStep";
import type { ProcessStatus } from "./orderDetailApi";
import { displayedProcessStatus, processStatusIndex, processStepState, PRODUCT_PROCESS_STEPS } from "./processStatusUtils";

type ProcessAccent = "gray" | "orange" | "violet";

const ACCENT_CLASSES = {
  orange: {
    complete: "border-orange-400 bg-orange-400", connectorActive: "bg-orange-400",
    current: "border-orange-500 bg-white ring-4 ring-orange-100", currentDot: "size-2 bg-orange-500",
    currentText: "font-extrabold text-orange-700", completeText: "font-bold text-orange-600",
  },
  violet: {
    complete: "border-violet-400 bg-violet-400", connectorActive: "bg-violet-400",
    current: "border-violet-500 bg-white ring-4 ring-violet-100", currentDot: "size-2 bg-violet-500",
    currentText: "font-extrabold text-violet-700", completeText: "font-bold text-violet-600",
  },
  gray: {
    complete: "border-gray-400 bg-gray-400", connectorActive: "bg-gray-400",
    current: "border-gray-400 bg-white ring-4 ring-gray-100", currentDot: "size-2 bg-gray-400",
    currentText: "font-extrabold text-gray-500", completeText: "font-bold text-gray-500",
  },
} as const;

export default function ProcessProgress({ accent = "gray", disabled = false, disabledStatuses = [], editable = false, status, pendingStatus, onChange }: {
  accent?: ProcessAccent;
  disabled?: boolean;
  disabledStatuses?: ProcessStatus[];
  editable?: boolean;
  status?: ProcessStatus | null;
  pendingStatus?: ProcessStatus | null;
  onChange?: (status: ProcessStatus) => void;
}) {
  const currentIndex = processStatusIndex(displayedProcessStatus(status, pendingStatus));
  const colors = ACCENT_CLASSES[accent];

  return (
    <div className={`min-w-[340px] ${disabled ? "cursor-not-allowed" : ""}`}>
      <div className="flex items-start">
        {PRODUCT_PROCESS_STEPS.map(([label, value], index) => {
          const stepDisabled = disabledStatuses.includes(value);
          const { complete, current } = processStepState({ currentIndex, disabled, index, stepDisabled });
          return <ProcessStep complete={complete} completeClassName={colors.complete} completeTextClassName={colors.completeText}
            connectorActiveClassName={index <= currentIndex ? colors.connectorActive : "bg-gray-300"} current={current}
            currentClassName={colors.current} currentDotClassName={colors.currentDot} currentTextClassName={colors.currentText}
            disabled={disabled} editable={editable} index={index} key={value} label={label} onChange={onChange} stepDisabled={stepDisabled} value={value} />;
        })}
      </div>
    </div>
  );
}
