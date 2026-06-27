import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, CalendarRange } from "lucide-react";
import { format } from "date-fns";

const typeIcons: Record<string, string> = {
  instagram_reel: "🎬", instagram_post: "📸", facebook_post: "📘", linkedin_post: "💼", story: "📱",
};
const statusColors: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700", draft: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700", published: "bg-green-100 text-green-700",
};

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: posts } = await supabase
    .from("social_posts")
    .select("*, creator:profiles!social_posts_created_by_fkey(full_name), assignee:profiles!social_posts_assigned_to_fkey(full_name)")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Social Media"
        description="Content calendar & posts"
        action={<Link href="/more/social/new"><Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> New Post</Button></Link>}
      />
      <div className="px-4 space-y-2">
        {!posts?.length ? (
          <EmptyState icon={CalendarRange} title="No posts yet" description="Plan your social media content" action={<Link href="/more/social/new"><Button><Plus className="w-4 h-4 mr-2" /> Create Post</Button></Link>} />
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border-0 shadow-sm py-0 hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[post.post_type] || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.caption?.substring(0, 80) || "No caption"}{post.caption && post.caption.length > 80 ? "..." : ""}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[post.status]}`}>{post.status}</Badge>
                      <span className="text-[10px] text-muted-foreground capitalize">{post.post_type.replace("_", " ")}</span>
                      {post.scheduled_at && <span className="text-[10px] text-muted-foreground">📅 {format(new Date(post.scheduled_at), "dd MMM, hh:mm a")}</span>}
                    </div>
                    {post.assignee && <p className="text-[10px] text-muted-foreground mt-1">👤 {post.assignee.full_name}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
