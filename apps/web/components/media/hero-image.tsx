import { createClient } from "@/lib/supabase/server";

// شريط صورة كبير (هيرو) لأعلى صفحات التفاصيل — يعرض أول صورة مرفوعة مع تدرّج داكن.
// لا يَظهر شيء إن لم توجد صور.
export async function HeroImage({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("storage_path, caption")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("kind", "image")
    .order("created_at", { ascending: true })
    .limit(1);

  const first = (media ?? [])[0];
  if (!first) return null;

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${first.storage_path}`;

  return (
    <div className="relative mb-6 h-48 w-full overflow-hidden rounded-3xl shadow-luxe sm:h-64">
      <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-gold via-brand-brass to-brand-gold opacity-90" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={first.caption ?? ""}
        className="h-full w-full object-cover transition duration-700 hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-night/65 via-brand-night/10 to-transparent" />
    </div>
  );
}
