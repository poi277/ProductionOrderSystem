import ProcessProgress from "./ProcessProgress";
import type { ProcessStatus } from "./orderDetailApi";

export default function ProductProcessProgress({
  editing,
  onChange,
  pendingStatus,
  status,
}: {
  editing: boolean;
  onChange: (status: ProcessStatus) => void;
  pendingStatus: ProcessStatus | null;
  status?: ProcessStatus | null;
}) {
  return (
    <ProcessProgress
      accent={editing ? "violet" : "gray"}
      disabled={!editing}
      disabledStatuses={["SHIPPED"]}
      editable={editing}
      onChange={onChange}
      pendingStatus={pendingStatus}
      status={status}
    />
  );
}

