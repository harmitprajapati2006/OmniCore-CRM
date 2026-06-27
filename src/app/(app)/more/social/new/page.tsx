import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewPostForm } from "./new-post-form";

export default async function NewSocialPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  return <NewPostForm organizationId={profile.organization_id} userId={user.id} />;
}
