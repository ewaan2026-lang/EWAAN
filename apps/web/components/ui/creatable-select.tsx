"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { fieldClass } from "@/components/ui/field";
import { PlusIcon } from "@/components/ui/icons";

export type Opt = { id: string; label: string };

// قائمة اختيار مع زر "إضافة جديد" يفتح نافذة بنفس فورم الكيان،
// وعند الإنشاء يُضاف الخيار ويُحدَّد تلقائياً.
export function CreatableSelect({
  name,
  options,
  defaultValue = "",
  required,
  placeholder = "—",
  addLabel,
  title,
  renderForm,
}: {
  name: string;
  options: Opt[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  addLabel: string;
  title: string;
  renderForm: (onCreated: (o: Opt) => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Opt[]>(options);
  const [value, setValue] = useState(defaultValue);

  const onCreated = (o: Opt) => {
    setOpts((prev) => [o, ...prev.filter((x) => x.id !== o.id)]);
    setValue(o.id);
    setOpen(false);
  };

  return (
    <div className="flex items-stretch gap-2">
      <select
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`${fieldClass} flex-1`}
      >
        <option value="">{placeholder}</option>
        {opts.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={addLabel}
        aria-label={addLabel}
        className="flex shrink-0 items-center justify-center rounded-xl border border-brand-teal/20 bg-white px-3 text-brand-teal-900 transition hover:border-brand-brass/40 hover:bg-brand-teal/5"
      >
        <PlusIcon className="h-4 w-4 text-brand-teal" />
      </button>
      {open ? (
        <Modal title={title} onClose={() => setOpen(false)}>
          {renderForm(onCreated)}
        </Modal>
      ) : null}
    </div>
  );
}
