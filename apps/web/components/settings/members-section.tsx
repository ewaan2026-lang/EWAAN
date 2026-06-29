import { getTranslations } from "next-intl/server";
import {
  updateMemberRoleAction,
  removeMemberAction,
} from "@/lib/actions/members";
import { fieldClass } from "@/components/ui/field";
import { UsersIcon, TrashIcon } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isSelf: boolean;
};

export type RoleOption = { id: string; label: string };

function initials(s: string) {
  const parts = s.trim().split(/\s+/).slice(0, 2);
  return (parts.map((p) => p[0]).join("") || "?").toUpperCase();
}

export async function MembersSection({
  members,
  roles,
  locale,
}: {
  members: MemberRow[];
  roles: RoleOption[];
  locale: string;
}) {
  const t = await getTranslations("settings");

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-brand-teal/10 bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-brand-teal/8 bg-gradient-to-l from-brand-teal/5 to-transparent px-7 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
          <UsersIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-brand-teal-900">{t("membersTitle")}</h2>
          <p className="text-xs text-brand-teal-900/55">{t("membersSubtitle")}</p>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="px-7 py-8 text-center text-sm text-brand-teal-900/55">
          {t("noMembers")}
        </p>
      ) : (
        <div>
          {members.map((m, i) => (
            <div
              key={m.id}
              className={`flex flex-wrap items-center gap-3 px-7 py-4 ${
                i > 0 ? "border-t border-brand-teal/8" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal to-brand-teal-900 text-xs font-extrabold text-white" dir="ltr">
                {initials(m.name || m.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-bold text-brand-teal-900">
                  <span className="truncate">{m.name || m.email}</span>
                  {m.isSelf ? <Badge tone="teal">{t("memberYou")}</Badge> : null}
                </p>
                {m.email ? (
                  <p className="truncate text-xs text-brand-teal-900/50" dir="ltr">
                    {m.email}
                  </p>
                ) : null}
              </div>

              <form action={updateMemberRoleAction} className="flex items-center gap-2">
                <input type="hidden" name="member_id" value={m.id} />
                <input type="hidden" name="locale" value={locale} />
                <select
                  name="role_id"
                  defaultValue={m.roleId}
                  className={`${fieldClass} max-w-[150px] py-2`}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-teal/10 px-3 py-2 text-xs font-bold text-brand-teal-900 transition hover:bg-brand-teal hover:text-white"
                >
                  {t("memberSave")}
                </button>
              </form>

              {!m.isSelf ? (
                <form action={removeMemberAction}>
                  <input type="hidden" name="member_id" value={m.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    aria-label={t("memberRemove")}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-teal-900/45 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <TrashIcon className="h-[18px] w-[18px]" />
                  </button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
