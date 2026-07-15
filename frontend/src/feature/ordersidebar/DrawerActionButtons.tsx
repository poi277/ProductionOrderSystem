import SavingButtonContent from "../common/SavingButtonContent";

export default function DrawerActionButtons({ canSave, deletable, isPending, onDelete, onSave }: {
  canSave: boolean;
  deletable: boolean;
  isPending: boolean;
  onDelete: () => void;
  onSave: () => void;
}) {
  return <div className="sticky bottom-0 z-20 flex gap-2 border-t border-slate-200 bg-white p-3"><button className="h-9 flex-1 rounded-lg bg-slate-900 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canSave || isPending} onClick={onSave} type="button"><SavingButtonContent idleText="저장" isSaving={isPending} savingText="처리 중..." /></button><button className="h-9 flex-1 rounded-lg border border-rose-200 text-xs font-bold text-rose-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300" disabled={!deletable || isPending} onClick={onDelete} type="button"><SavingButtonContent idleText="삭제" isSaving={isPending} savingText="처리 중..." /></button></div>;
}
