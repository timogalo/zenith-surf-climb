import AdminNav from "@/components/admin/AdminNav";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { requireAdminSession } from "@/lib/admin/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminCredential } from "@/lib/admin/credentials";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const lastChangedFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AdminSettingsPage() {
  await requireAdminSession();

  const supabase = getSupabaseServerClient();
  const credentialResult = await getAdminCredential(supabase);
  const lastChanged = credentialResult.ok
    ? lastChangedFormatter.format(new Date(credentialResult.credential.updatedAt))
    : null;

  return (
    <main className="min-h-screen bg-warm-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <AdminNav active="settings" />

        <h1 className="mt-8 font-heading text-2xl text-ocean-navy">Settings</h1>

        <div className="mt-6 border border-ocean-navy/10 bg-white p-8">
          <h2 className="font-heading text-lg text-ocean-navy">Security</h2>
          <p className="mt-2 font-body text-sm text-ocean-navy/60">Change your admin password.</p>
          {lastChanged && (
            <p className="mt-1 font-body text-xs text-ocean-navy/40">Last changed: {lastChanged}</p>
          )}

          <ChangePasswordForm minLength={MIN_PASSWORD_LENGTH} />
        </div>
      </div>
    </main>
  );
}
