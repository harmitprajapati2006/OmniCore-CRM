"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NewPostFormProps { organizationId: string; userId: string; }

export function NewPostForm({ organizationId, userId }: NewPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function handleAiCaption() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: caption || "Real estate property listing" }),
      });
      const data = await res.json();
      if (data.content) setCaption(data.content);
      else toast.info("AI not configured. Add OPENAI_API_KEY to .env.local");
    } catch {
      toast.error("AI generation failed");
    }
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const hashtagsRaw = (formData.get("hashtags") as string) || "";
    const hashtags = hashtagsRaw.split(",").map(h => h.trim()).filter(Boolean);

    const { error } = await supabase.from("social_posts").insert({
      organization_id: organizationId,
      created_by: userId,
      post_type: formData.get("post_type") as string,
      status: formData.get("status") as string || "idea",
      caption,
      hashtags,
      scheduled_at: (formData.get("scheduled_at") as string) || null,
      notes: (formData.get("notes") as string) || null,
      assigned_to: (formData.get("assigned_to") as string) || null,
    });

    if (error) { toast.error("Failed: " + error.message); setLoading(false); return; }
    toast.success("Post created!");
    router.push("/more/social");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="animate-slide-up">
      <PageHeader title="New Post" action={<Link href="/more/social"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>} />
      <form onSubmit={handleSubmit} className="px-4 space-y-4 pb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Post Type</Label>
                <Select name="post_type" defaultValue="instagram_post">
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram_post">📸 Instagram Post</SelectItem>
                    <SelectItem value="instagram_reel">🎬 Instagram Reel</SelectItem>
                    <SelectItem value="facebook_post">📘 Facebook Post</SelectItem>
                    <SelectItem value="linkedin_post">💼 LinkedIn Post</SelectItem>
                    <SelectItem value="story">📱 Story</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue="idea">
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">💡 Idea</SelectItem>
                    <SelectItem value="draft">📝 Draft</SelectItem>
                    <SelectItem value="scheduled">📅 Scheduled</SelectItem>
                    <SelectItem value="published">✅ Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Caption</Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleAiCaption} disabled={aiLoading} className="text-xs gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {aiLoading ? "Generating..." : "AI Suggest"}
                </Button>
              </div>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write your caption..." rows={4} />
            </div>
            <div className="space-y-2"><Label>Hashtags (comma separated)</Label><Input name="hashtags" placeholder="#realestate, #luxury, #home" className="h-12" /></div>
            <div className="space-y-2"><Label>Schedule Date/Time</Label><Input name="scheduled_at" type="datetime-local" className="h-12" /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" placeholder="Internal notes..." rows={2} /></div>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Post
        </Button>
      </form>
    </div>
  );
}
