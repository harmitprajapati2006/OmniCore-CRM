import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddPropertyForm } from "./add-property-form";

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");
  return <AddPropertyForm organizationId={profile.organization_id} />;
}
