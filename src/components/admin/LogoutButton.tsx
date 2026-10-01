import { logoutAction } from "@/app/admin/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="border border-ocean-navy/25 px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-ocean-navy transition-colors hover:border-terracotta hover:text-terracotta"
      >
        Log out
      </button>
    </form>
  );
}
