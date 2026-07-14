import type { ProcessStatus } from "./orderDetailApi";

export const PRODUCT_PROCESS_STEPS = [
  ["생산지시", "INSTRUCTION"], ["생산중", "ASSEMBLY"], ["기능검사", "TEST"],
  ["출하검사", "FINAL_INSPECTION"], ["포장", "PACKAGING"], ["납품대기", "WAITING_FOR_SHIPMENT"],
] as const;

export default function ProductProcessStep({ accent = "gray", disabled, editable, status, pendingStatus, onChange }: {
  accent?: "gray" | "orange" | "violet";
  disabled?: boolean; editable?: boolean; status?: ProcessStatus | null; pendingStatus?: ProcessStatus | null;
  onChange?: (status: ProcessStatus) => void;
}) {
  const shownStatus = pendingStatus ?? status;
  const currentIndex = PRODUCT_PROCESS_STEPS.findIndex(([, value]) => value === shownStatus);
  const colors = accent === "orange"
    ? {
        complete: "border-orange-400 bg-orange-400",
        connectorActive: "bg-orange-400",
        current: "border-orange-500 bg-white ring-4 ring-orange-100",
        currentDot: "size-2 bg-orange-500",
        currentText: "font-extrabold text-orange-700",
        completeText: "font-bold text-orange-600",
      }
    : accent === "violet"
      ? {
          complete: "border-violet-400 bg-violet-400",
          connectorActive: "bg-violet-400",
          current: "border-violet-500 bg-white ring-4 ring-violet-100",
          currentDot: "size-2 bg-violet-500",
          currentText: "font-extrabold text-violet-700",
          completeText: "font-bold text-violet-600",
        }
    : {
        complete: "border-gray-500 bg-gray-500",
        connectorActive: "bg-gray-500",
        current: "border-gray-600 bg-white ring-4 ring-gray-200",
        currentDot: "size-2 bg-gray-600",
        currentText: "font-extrabold text-gray-800",
        completeText: "font-bold text-gray-700",
      };

  return (
    <div className={`min-w-[340px] ${disabled ? "cursor-not-allowed opacity-55" : ""}`}>
      <div className="flex items-start">
        {PRODUCT_PROCESS_STEPS.map(([label, value], index) => {
          const complete = !disabled && index < currentIndex;
          const current = !disabled && index === currentIndex;
          return (
            <button className={`relative flex flex-1 flex-col items-center ${editable ? "cursor-pointer" : "cursor-default"}`}
              disabled={disabled || !editable} key={value} onClick={() => onChange?.(value)} type="button">
              {index > 0 && <span className={`absolute right-1/2 top-[7px] h-0.5 w-full ${index <= currentIndex ? colors.connectorActive : "bg-gray-200"}`} />}
              <span className={`relative z-10 flex size-4 items-center justify-center rounded-full border-2 ${
                complete ? colors.complete : current ? colors.current : "border-gray-300 bg-white"
              }`}><span className={`rounded-full ${complete ? "size-1.5 bg-white" : current ? colors.currentDot : ""}`} /></span>
              <span className={`mt-2 whitespace-nowrap text-[9px] ${current ? colors.currentText : complete ? colors.completeText : "text-gray-400"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
