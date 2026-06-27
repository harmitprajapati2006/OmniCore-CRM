import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(name)")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name || user.email || "User";
  const orgName = (profile?.organizations as { name: string } | null)?.name || "EstateFlow";

  return (
    <div className="min-h-dvh bg-background">
      <TopBar userName={userName} orgName={orgName} />
      <main className="pb-20 md:pb-6 max-w-screen-xl mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
