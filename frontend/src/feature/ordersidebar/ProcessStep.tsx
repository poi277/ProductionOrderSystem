import type { ProcessStatus } from "./orderDetailApi";

type ProcessStepProps = {
  complete: boolean;
  completeClassName: string;
  completeTextClassName: string;
  connectorActiveClassName: string;
  current: boolean;
  currentClassName: string;
  currentDotClassName: string;
  currentTextClassName: string;
  disabled: boolean;
  editable: boolean;
  index: number;
  label: string;
  onChange?: (status: ProcessStatus) => void;
  stepDisabled: boolean;
  value: ProcessStatus;
};

export default function ProcessStep({
  complete,
  completeClassName,
  completeTextClassName,
  connectorActiveClassName,
  current,
  currentClassName,
  currentDotClassName,
  currentTextClassName,
  disabled,
  editable,
  index,
  label,
  onChange,
  stepDisabled,
  value,
}: ProcessStepProps) {
  return (
    <button className={`relative flex flex-1 flex-col items-center ${editable && !stepDisabled ? "cursor-pointer" : "cursor-default"} ${stepDisabled ? "opacity-15" : ""}`}
      disabled={disabled || !editable || stepDisabled} key={value} onClick={() => onChange?.(value)} type="button">
      {index > 0 && <span className={`absolute right-1/2 top-[7px] h-0.5 w-full ${connectorActiveClassName}`} />}
      <span className={`relative z-10 flex size-4 items-center justify-center rounded-full border-2 ${
        complete ? completeClassName : current ? currentClassName : "border-gray-400 bg-white"
      }`}><span className={`rounded-full ${complete ? "size-1.5 bg-white" : current ? currentDotClassName : ""}`} /></span>
      <span className={`mt-2 whitespace-nowrap text-[9px] ${current ? currentTextClassName : complete ? completeTextClassName : "font-medium text-gray-500"}`}>{label}</span>
    </button>
  );
}
