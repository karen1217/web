import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProNav from "@/components/pro/ProNav";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      {user && (
        <Suspense fallback={
          <nav className="border-b border-border px-4 py-3 h-[53px] flex items-center">
            <div className="max-w-5xl mx-auto w-full">
              <span className="font-semibold text-sm tracking-tight">Angle Log</span>
            </div>
          </nav>
        }>
          <ProNav
            email={user.email ?? ""}
            displayName={(user.user_metadata?.display_name as string | undefined) ?? ""}
          />
        </Suspense>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
