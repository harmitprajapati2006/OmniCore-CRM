"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck, Phone, MessageSquare, Mail, Check, Clock } from "lucide-react";
import { format, isToday, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import { messageUtils } from "@/lib/message-utils";

interface FollowupsContentProps {
  followups: Array<{
    id: string; type: string; status: string; title: string; notes: string | null;
    scheduled_at: string; message_body: string | null;
    lead?: { id: string; full_name: string; phone: string } | null;
    assigned_agent?: { full_name: string } | null;
  }>;
  currentUserId: string;
  organizationId: string;
}

const typeIcons: Record<string, React.ElementType> = {
  call: Phone, whatsapp: MessageSquare, sms: MessageSquare, email: Mail, site_visit: CalendarCheck,
};

export function FollowupsContent({ followups, currentUserId, organizationId }: FollowupsContentProps) {
  const router = useRouter();

  const pending = followups.filter(f => f.status === "pending");
  const overdue = pending.filter(f => isPast(new Date(f.scheduled_at)) && !isToday(new Date(f.scheduled_at)));
  const todayItems = pending.filter(f => isToday(new Date(f.scheduled_at)));
  const upcoming = pending.filter(f => isFuture(new Date(f.scheduled_at)) && !isToday(new Date(f.scheduled_at)));
  const completed = followups.filter(f => f.status === "completed");

  async function markComplete(id: string) {
    const supabase = createClient();
    await supabase.from("followups").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
    toast.success("Follow-up completed");
    router.refresh();
  }

  async function snooze(id: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const supabase = createClient();
    await supabase.from("followups").update({ scheduled_at: tomorrow.toISOString(), snoozed_until: tomorrow.toISOString() }).eq("id", id);
    toast.success("Snoozed to tomorrow 10 AM");
    router.refresh();
  }

  function openWhatsApp(phone: string, leadName: string) {
    const link = messageUtils.generateWhatsAppLink(phone, `Hi ${leadName}, just following up on our earlier conversation.`);
    window.open(link, "_blank");
  }

  function renderList(items: typeof followups, label: string, showEmpty = true) {
    if (!items.length && !showEmpty) return null;
    return (
      <div>
        {items.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={`No ${label.toLowerCase()}`} description="All caught up!" />
        ) : (
          <div className="space-y-2">
            {items.map((fu) => {
              const Icon = typeIcons[fu.type] || CalendarCheck;
              const isOverdue = isPast(new Date(fu.scheduled_at)) && fu.status === "pending";
              return (
                <Card key={fu.id} className="border-0 shadow-sm py-0">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isOverdue ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fu.title}</p>
                        {fu.lead && (
                          <Link href={`/leads/${fu.lead.id}`} className="text-xs text-primary hover:underline">
                            {fu.lead.full_name} • {fu.lead.phone}
                          </Link>
                        )}
                        <p className={`text-[11px] mt-1 ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          {isOverdue ? "⚠️ Overdue: " : ""}{format(new Date(fu.scheduled_at), "dd MMM, hh:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {fu.status === "pending" && fu.lead && fu.type === "whatsapp" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => openWhatsApp(fu.lead!.phone, fu.lead!.full_name)}>
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                        {fu.status === "pending" && fu.lead && fu.type === "call" && (
                          <a href={`tel:${fu.lead.phone}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {fu.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => snooze(fu.id)} title="Snooze">
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => markComplete(fu.id)} title="Complete">
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {fu.status === "completed" && (
                          <Badge className="bg-green-100 text-green-700 text-[10px]">Done</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <PageHeader title="Follow-ups" description={`${overdue.length} overdue • ${todayItems.length} today`} />

      <div className="px-4">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-10 mb-4">
            <TabsTrigger value="overdue" className="text-xs">
              Overdue {overdue.length > 0 && <Badge className="ml-1 bg-red-500 text-white text-[9px] px-1 py-0">{overdue.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="today" className="text-xs">Today ({todayItems.length})</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs">Upcoming</TabsTrigger>
            <TabsTrigger value="done" className="text-xs">Done</TabsTrigger>
          </TabsList>
          <TabsContent value="overdue">{renderList(overdue, "overdue follow-ups")}</TabsContent>
          <TabsContent value="today">{renderList(todayItems, "follow-ups today")}</TabsContent>
          <TabsContent value="upcoming">{renderList(upcoming, "upcoming follow-ups")}</TabsContent>
          <TabsContent value="done">{renderList(completed.slice(0, 20), "completed follow-ups")}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
