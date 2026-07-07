type ListCheckboxProps = {
  checked?: boolean;
  onChange?: () => void;
};

export default function ListCheckbox({ checked = false, onChange }: ListCheckboxProps) {
  return (
    <input
      className="size-4 accent-[#143f80]"
      checked={checked}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      readOnly={!onChange}
      type="checkbox"
    />
  );
}
