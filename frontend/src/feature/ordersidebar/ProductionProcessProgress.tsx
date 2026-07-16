import ProcessProgress from "./ProcessProgress";
import type { ProcessStatus } from "./orderDetailApi";

export default function ProductionProcessProgress({
  active,
  displayEnabled,
  editable,
  hasProduction,
  onChange,
  pendingStatus,
  status,
}: {
  active: boolean;
  displayEnabled: boolean;
  editable: boolean;
  hasProduction: boolean;
  onChange: (status: ProcessStatus) => void;
  pendingStatus: ProcessStatus | null;
  status?: ProcessStatus | null;
}) {
  return (
    <ProcessProgress
      accent={active ? "orange" : "gray"}
      disabled={!displayEnabled}
      disabledStatuses={["SHIPPED"]}
      editable={active && hasProduction && editable}
      onChange={onChange}
      pendingStatus={pendingStatus}
      status={status}
    />
  );
}

