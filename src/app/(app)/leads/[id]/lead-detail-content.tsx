"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Phone, MessageSquare, Mail, Flame, Calendar,
  Building2, Clock, User, MapPin, Share2, Plus, Send
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import type { Lead, LeadStatus, Property } from "@/types";
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, TEMPERATURE_LABELS, PROPERTY_TYPE_LABELS } from "@/types";
import { messageUtils } from "@/lib/message-utils";

interface LeadDetailContentProps {
  lead: Lead & { assigned_agent?: { id: string; full_name: string; phone: string | null; avatar_url: string | null } | null };
  activities: Array<{ id: string; type: string; title: string; description: string | null; created_at: string; profiles?: { full_name: string } | null }>;
  calls: Array<{ id: string; status: string; duration: number; outcome: string; started_at: string; agent?: { full_name: string } | null }>;
  followups: Array<{ id: string; type: string; status: string; title: string; scheduled_at: string }>;
  shares: Array<{ id: string; created_at: string; channel: string | null; property?: { id: string; title: string; location: string; price: number | null } | null }>;
  recommendedProperties: Array<Property & { images?: Array<{ id: string; url: string; is_primary: boolean }> }>;
  agents: { id: string; full_name: string }[];
  currentUserId: string;
  organizationId: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", contacted: "bg-sky-100 text-sky-700",
  interested: "bg-green-100 text-green-700", site_visit_scheduled: "bg-purple-100 text-purple-700",
  negotiation: "bg-amber-100 text-amber-700", won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700", not_responding: "bg-gray-100 text-gray-700",
};

const activityIcons: Record<string, string> = {
  lead_created: "🆕", lead_assigned: "👤", lead_status_changed: "🔄",
  call_made: "📞", call_missed: "📵", message_sent: "💬",
  email_sent: "📧", note_added: "📝", followup_created: "📅",
  followup_completed: "✅", property_shared: "🏠", site_visit_scheduled: "📍",
};

export function LeadDetailContent({
  lead, activities, calls, followups, shares, recommendedProperties, agents, currentUserId, organizationId,
}: LeadDetailContentProps) {
  const router = useRouter();
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const formatBudget = (value: number | null) => {
    if (!value) return "—";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  async function updateStatus(newStatus: string | null) {
    if (!newStatus) return;
    const supabase = createClient();
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "won") updateData.won_at = new Date().toISOString();
    if (newStatus === "lost") updateData.lost_at = new Date().toISOString();

    const { error } = await supabase.from("leads").update(updateData).eq("id", lead.id);
    if (error) { toast.error("Failed to update status"); return; }

    await supabase.from("activities").insert({
      organization_id: organizationId, lead_id: lead.id, user_id: currentUserId,
      type: "lead_status_changed", title: `Status changed to ${LEAD_STATUS_LABELS[newStatus as LeadStatus]}`,
    });

    toast.success("Status updated");
    router.refresh();
  }

  async function updateTemperature(temp: string | null) {
    if (!temp) return;
    const supabase = createClient();
    await supabase.from("leads").update({ temperature: temp }).eq("id", lead.id);
    toast.success("Temperature updated");
    router.refresh();
  }

  async function reassignAgent(agentId: string | null) {
    if (!agentId) return;
    const supabase = createClient();
    await supabase.from("leads").update({ assigned_agent_id: agentId }).eq("id", lead.id);
    await supabase.from("activities").insert({
      organization_id: organizationId, lead_id: lead.id, user_id: currentUserId,
      type: "lead_assigned", title: "Lead reassigned",
    });
    toast.success("Agent reassigned");
    router.refresh();
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setAddingNote(true);
    const supabase = createClient();
    const currentNotes = lead.notes ? `${lead.notes}\n\n[${format(new Date(), "dd/MM/yyyy HH:mm")}] ${noteText}` : `[${format(new Date(), "dd/MM/yyyy HH:mm")}] ${noteText}`;
    await supabase.from("leads").update({ notes: currentNotes }).eq("id", lead.id);
    await supabase.from("activities").insert({
      organization_id: organizationId, lead_id: lead.id, user_id: currentUserId,
      type: "note_added", title: "Note added", description: noteText,
    });
    setNoteText("");
    setAddingNote(false);
    toast.success("Note added");
    router.refresh();
  }

  function openWhatsApp() {
    const message = `Hi ${lead.full_name}, this is from ${organizationId}. How can I help you with your property search?`;
    const link = messageUtils.generateWhatsAppLink(lead.phone, message);
    window.open(link, "_blank");
  }

  function callLead() {
    window.open(`tel:${lead.phone}`, "_self");
  }

  return (
    <div className="animate-slide-up pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Leads
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{lead.full_name}</h1>
              {lead.temperature === "hot" && <Flame className="w-5 h-5 text-red-500" />}
            </div>
            <p className="text-sm text-muted-foreground">{lead.phone}</p>
            {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
          </div>
          <Badge className={`${statusColors[lead.status]} text-xs`}>
            {LEAD_STATUS_LABELS[lead.status]}
          </Badge>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 gap-1.5" onClick={callLead}>
            <Phone className="w-4 h-4" /> Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-green-600 border-green-200 hover:bg-green-50" onClick={openWhatsApp}>
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </Button>
          <Link href={`/leads/${lead.id}/share`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Share2 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Lead Info Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Source</span>
              <p className="font-medium">{LEAD_SOURCE_LABELS[lead.source]}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Property Type</span>
              <p className="font-medium">{lead.property_type ? PROPERTY_TYPE_LABELS[lead.property_type] : "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Budget</span>
              <p className="font-medium">{formatBudget(lead.budget_min)} – {formatBudget(lead.budget_max)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Location</span>
              <p className="font-medium">{lead.preferred_location || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Created</span>
              <p className="font-medium">{format(new Date(lead.created_at), "dd MMM yyyy")}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Last Contact</span>
              <p className="font-medium">
                {lead.last_contacted_at ? formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true }) : "Never"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Update Controls */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={lead.status} onValueChange={updateStatus}>
            <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lead.temperature} onValueChange={updateTemperature}>
            <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="warm">🌤 Warm</SelectItem>
              <SelectItem value="cold">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lead.assigned_agent_id || ""} onValueChange={reassignAgent}>
            <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Assign" /></SelectTrigger>
            <SelectContent>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs: Timeline, Calls, Follow-ups, Properties */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-10">
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
            <TabsTrigger value="calls" className="text-xs">Calls ({calls.length})</TabsTrigger>
            <TabsTrigger value="followups" className="text-xs">Follow-ups</TabsTrigger>
            <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-3 space-y-3">
            {/* Add Note */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3">
                <Textarea
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  className="mb-2"
                />
                <Button size="sm" onClick={addNote} disabled={addingNote || !noteText.trim()}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Add Note
                </Button>
              </CardContent>
            </Card>

            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <span className="text-lg mt-0.5 shrink-0">{activityIcons[activity.type] || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {activity.profiles?.full_name && `${activity.profiles.full_name} • `}
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="calls" className="mt-3 space-y-2">
            {calls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No calls yet</p>
            ) : (
              calls.map((call) => (
                <Card key={call.id} className="border-0 shadow-sm py-0">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{call.agent?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(call.started_at), "dd MMM, HH:mm")} • {call.duration}s
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">{call.outcome}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="followups" className="mt-3 space-y-2">
            <Link href={`/followups?lead=${lead.id}`}>
              <Button variant="outline" size="sm" className="w-full gap-1.5 mb-2">
                <Plus className="w-4 h-4" /> Schedule Follow-up
              </Button>
            </Link>
            {followups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No follow-ups scheduled</p>
            ) : (
              followups.map((fu) => (
                <Card key={fu.id} className="border-0 shadow-sm py-0">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{fu.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(fu.scheduled_at), "dd MMM, HH:mm")}
                      </p>
                    </div>
                    <Badge variant={fu.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {fu.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="properties" className="mt-3 space-y-3">
            {/* Shared Properties */}
            {shares.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Shared</h4>
                {shares.map((share) => (
                  <Card key={share.id} className="border-0 shadow-sm mb-2 py-0">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{share.property?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {share.property?.location} • {share.channel || "link"}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Recommended */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recommended</h4>
              {recommendedProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No matching properties found</p>
              ) : (
                recommendedProperties.map((prop) => {
                  const primaryImage = prop.images?.find((img) => img.is_primary) || prop.images?.[0];
                  return (
                    <Card key={prop.id} className="border-0 shadow-sm mb-2 py-0 overflow-hidden">
                      <CardContent className="p-0 flex">
                        {primaryImage && (
                          <div className="w-24 h-20 bg-muted shrink-0">
                            <img src={primaryImage.url} alt={prop.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3 flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{prop.title}</p>
                          <p className="text-xs text-muted-foreground">{prop.location}</p>
                          <p className="text-xs font-semibold text-primary mt-1">
                            {prop.price ? `₹${(prop.price / 10000000).toFixed(1)}Cr` : "Price on request"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes */}
        {lead.notes && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
