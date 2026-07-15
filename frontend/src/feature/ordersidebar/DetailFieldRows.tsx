import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const fieldClassName =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]";

type FieldRowProps = {
  children: ReactNode;
  label: string;
};

type InputFieldRowProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "onChange" | "type"> & {
  label: string;
  onChange?: (value: string) => void;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
};

type SelectFieldRowProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "onChange"> & {
  children: ReactNode;
  label: string;
  onChange?: (value: string) => void;
};

function FieldRow({ children, label }: FieldRowProps) {
  return (
    <label className="grid grid-cols-[84px_minmax(0,1fr)] items-start gap-2 text-xs">
      <span className="pt-2 font-extrabold text-slate-900">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}

function handleInputChange(onChange?: (value: string) => void) {
  return (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value);
}

export function TextFieldRow({ label, onChange, type = "text", ...inputProps }: InputFieldRowProps) {
  return (
    <FieldRow label={label}>
      <input className={fieldClassName} onChange={handleInputChange(onChange)} type={type} {...inputProps} />
    </FieldRow>
  );
}

export function NumberFieldRow({ label, onChange, ...inputProps }: InputFieldRowProps) {
  return (
    <FieldRow label={label}>
      <input className={fieldClassName} onChange={handleInputChange(onChange)} type="number" {...inputProps} />
    </FieldRow>
  );
}

export function ReadonlyFieldRow({ label, value = "", ...inputProps }: Omit<InputFieldRowProps, "onChange">) {
  return (
    <FieldRow label={label}>
      <input className={fieldClassName} disabled type="text" value={value} {...inputProps} />
    </FieldRow>
  );
}

export function SelectFieldRow({ children, label, onChange, ...selectProps }: SelectFieldRowProps) {
  return (
    <FieldRow label={label}>
      <select
        className={fieldClassName}
        onChange={(event) => onChange?.(event.target.value)}
        {...selectProps}
      >
        {children}
      </select>
    </FieldRow>
  );
}
