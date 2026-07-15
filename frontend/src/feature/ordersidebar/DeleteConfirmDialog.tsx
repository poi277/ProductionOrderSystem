export default function DeleteConfirmDialog({
  disabled,
  isOpen,
  onCancel,
  onConfirm,
}: {
  disabled: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-[280px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-bold text-slate-900">정말로 삭제하시겠어요?</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="h-8 rounded-md bg-red-600 text-xs font-bold text-white disabled:bg-slate-300"
            disabled={disabled}
            onClick={onConfirm}
            type="button"
          >
            예
          </button>
          <button
            className="h-8 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-600"
            onClick={onCancel}
            type="button"
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}
