export default function SavingButtonContent({
  idleText,
  isSaving,
  savingText,
}: {
  idleText: string;
  isSaving: boolean;
  savingText: string;
}) {
  return isSaving ? savingText : idleText;
}
