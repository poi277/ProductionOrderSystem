import SavingButtonContent from "../common/SavingButtonContent";

export default function CreatePanelActionButtons({
  cancelText,
  isSaving,
  onCancel,
  submitButtonClassName,
  submitText,
  submittingText,
}: {
  cancelText: string;
  isSaving: boolean;
  onCancel: () => void;
  submitButtonClassName: string;
  submitText: string;
  submittingText: string;
}) {
  return (
    <div className="flex gap-2">
      <button
        className={`h-8 flex-1 rounded-md ${submitButtonClassName} text-xs font-bold disabled:bg-slate-300`}
        disabled={isSaving}
        type="submit"
      >
        <SavingButtonContent idleText={submitText} isSaving={isSaving} savingText={submittingText} />
      </button>
      <button
        className="h-8 flex-1 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-500"
        onClick={onCancel}
        type="button"
      >
        {cancelText}
      </button>
    </div>
  );
}
