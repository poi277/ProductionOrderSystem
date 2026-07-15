import SavingButtonContent from "../common/SavingButtonContent";

export default function DetailActionButtons({
  deleteText,
  isSaving,
  onDelete,
  saveDisabled,
  saveText,
  savingText,
  saveClassName = "h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300",
}: {
  deleteText: string;
  isSaving: boolean;
  onDelete: () => void;
  saveDisabled: boolean;
  saveText: string;
  savingText?: string;
  saveClassName?: string;
}) {
  return (
    <div className="flex gap-2">
      <button className={saveClassName} disabled={isSaving || saveDisabled} type="submit">
        <SavingButtonContent idleText={saveText} isSaving={isSaving && Boolean(savingText)} savingText={savingText ?? saveText} />
      </button>
      <button
        className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
        disabled={isSaving}
        onClick={onDelete}
        type="button"
      >
        {deleteText}
      </button>
    </div>
  );
}
