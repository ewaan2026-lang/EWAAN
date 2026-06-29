"use client";

import { useEffect, useRef, useState } from "react";
import { fieldClass } from "@/components/ui/field";

export type ComboOption = { id: number; label: string };

// قائمة منسدلة قابلة للبحث مع إمكانية الكتابة الحرّة (free-solo).
export function AddressCombobox({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  onSelectOption,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: ComboOption[];
  placeholder?: string;
  disabled?: boolean;
  onSelectOption?: (opt: ComboOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const q = value.trim().toLowerCase();
  const filtered = (
    q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  ).slice(0, 60);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (o: ComboOption) => {
    onChange(o.label);
    onSelectOption?.(o);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        name={name}
        value={value}
        disabled={disabled}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            if (open && filtered[active]) {
              e.preventDefault();
              pick(filtered[active]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={fieldClass}
      />
      {open && filtered.length > 0 ? (
        <ul className="absolute z-[1100] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-brand-teal/15 bg-white py-1 shadow-luxe">
          {filtered.map((o, i) => (
            <li key={o.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
                className={`block w-full px-3.5 py-2 text-start text-sm transition ${
                  i === active
                    ? "bg-brand-teal/10 font-semibold text-brand-teal-900"
                    : "text-brand-teal-900/75 hover:bg-brand-teal/5"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
