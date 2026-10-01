import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin/dal";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

// robots noindex/nofollow for the whole /admin subtree is set once in
// src/app/admin/layout.tsx.

type AdminLoginPageProps = {
  searchParams: Promise<{ passwordChanged?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await hasValidAdminSession()) {
    redirect("/admin");
  }

  const { passwordChanged } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-white px-6 py-16">
      <div className="w-full max-w-sm border border-ocean-navy/10 bg-white px-8 py-10">
        <p className="font-body text-xs uppercase tracking-[0.14em] text-ocean-navy/45">
          Zenith Nomads
        </p>
        <h1 className="mt-4 font-heading text-xl text-ocean-navy">Admin sign in</h1>
        {passwordChanged === "1" && (
          <p role="status" className="mt-4 font-body text-sm text-ocean-navy/70">
            Password changed. Sign in with your new password.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
