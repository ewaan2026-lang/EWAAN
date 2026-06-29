"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { PlusIcon } from "@/components/ui/icons";

// رفع مستند (PDF/صور/Word) إلى Storage وتسجيله في جدول media (kind=document).
export function DocumentUploader({
  organizationId,
  entityType,
  entityId,
  label,
}: {
  organizationId: string;
  entityType: string;
  entityId: string;
  label?: string;
}) {
  const t = useTranslations("media");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      const supabase = createClient();
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${organizationId}/${entityType}/${entityId}/${Date.now()}-${rand}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("media").insert({
        organization_id: organizationId,
        entity_type: entityType,
        entity_id: entityId,
        kind: "document",
        storage_path: path,
        caption: file.name,
      });
      if (insErr) throw insErr;
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/20 bg-white px-4 py-2.5 text-sm font-bold text-brand-teal-900 shadow-card transition hover:border-brand-teal/40 hover:bg-brand-teal/5 disabled:opacity-60"
      >
        <PlusIcon className="h-4 w-4 text-brand-teal" />
        {busy ? t("uploading") : (label ?? t("uploadDocument"))}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
        onChange={onChange}
        className="hidden"
      />
      {error ? <p className="mt-2 text-xs text-rose-600">{t("uploadError")}</p> : null}
    </div>
  );
}
