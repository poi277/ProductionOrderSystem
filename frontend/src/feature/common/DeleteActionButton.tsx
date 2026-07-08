"use client";

type DeleteActionButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
  selectedCount?: number;
};

export default function DeleteActionButton({ disabled = false, onClick, selectedCount = 0 }: DeleteActionButtonProps) {
  return (
    <button
      className="h-10 w-28 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {selectedCount > 0 ? `삭제 (${selectedCount})` : "삭제"}
    </button>
  );
}
