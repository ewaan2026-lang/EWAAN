import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DocumentUploader } from "@/components/media/document-uploader";
import { deleteMediaAction } from "@/lib/actions/media";
import { FileTextIcon, DownloadIcon, TrashIcon } from "@/components/ui/icons";

// بطاقة مستندات لكيان (عقار/مستأجر/عقد) — رفع وعرض وتنزيل وحذف.
export async function DocumentsCard({
  organizationId,
  entityType,
  entityId,
  redirectPath,
  locale,
}: {
  organizationId: string;
  entityType: string;
  entityId: string;
  redirectPath: string;
  locale: string;
}) {
  const t = await getTranslations("media");
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("media")
    .select("id, storage_path, caption, created_at")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("kind", "document")
    .order("created_at", { ascending: false });

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;
  const items = docs ?? [];

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-brand-teal-900">
          <FileTextIcon className="h-[18px] w-[18px] text-brand-teal" />
          {t("documentsTitle")}
        </h2>
        <DocumentUploader
          organizationId={organizationId}
          entityType={entityType}
          entityId={entityId}
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-teal/20 bg-brand-cream/30 px-4 py-8 text-center text-sm text-brand-teal-900/55">
          {t("noDocuments")}
        </p>
      ) : (
        <ul className="divide-y divide-brand-teal/8">
          {items.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
              <a
                href={`${base}${m.storage_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2.5 text-sm text-brand-teal-900 transition hover:text-brand-teal"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
                  <FileTextIcon className="h-[18px] w-[18px]" />
                </span>
                <span className="truncate font-semibold">
                  {m.caption ?? m.storage_path.split("/").pop()}
                </span>
              </a>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={`${base}${m.storage_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("download")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-brand-teal/5 hover:text-brand-teal"
                >
                  <DownloadIcon className="h-4 w-4" />
                </a>
                <form action={deleteMediaAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="storage_path" value={m.storage_path} />
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="redirect_path" value={redirectPath} />
                  <button
                    type="submit"
                    aria-label="delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
