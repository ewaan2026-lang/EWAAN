import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ImageUploader } from "@/components/media/image-uploader";
import { deleteMediaAction } from "@/lib/actions/media";
import { TrashIcon } from "@/components/ui/icons";
import type { Enums } from "@ewaan/db";

export async function MediaGallery({
  organizationId,
  entityType,
  entityId,
  kind = "image",
  title,
  uploadLabel,
  redirectPath,
  locale,
}: {
  organizationId: string;
  entityType: string;
  entityId: string;
  kind?: Enums<"media_kind">;
  title: string;
  uploadLabel?: string;
  redirectPath: string;
  locale: string;
}) {
  const t = await getTranslations("media");
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("id, storage_path, kind, caption")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("kind", kind)
    .order("created_at", { ascending: false });

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;
  const items = media ?? [];

  return (
    <div className="rounded-2xl border border-brand-teal/10 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-brand-teal-900">{title}</h2>
        <ImageUploader
          organizationId={organizationId}
          entityType={entityType}
          entityId={entityId}
          kind={kind}
          label={uploadLabel}
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-teal/20 bg-brand-cream/30 px-4 py-8 text-center text-sm text-brand-teal-900/55">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div
              key={m.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-brand-teal/10 bg-brand-cream/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${base}${m.storage_path}`}
                alt={m.caption ?? ""}
                className="h-full w-full object-cover"
              />
              <form
                action={deleteMediaAction}
                className="absolute end-1.5 top-1.5 opacity-0 transition group-hover:opacity-100"
              >
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="storage_path" value={m.storage_path} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="redirect_path" value={redirectPath} />
                <button
                  type="submit"
                  aria-label="delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-rose-600 shadow-card transition hover:bg-rose-600 hover:text-white"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
