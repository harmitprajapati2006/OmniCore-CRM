"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Plus, Search, Phone, MessageSquare, Flame,
  Calendar, Filter, X, Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Lead, UserRole, LeadStatus, LeadSource, LeadTemperature } from "@/types";
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, TEMPERATURE_LABELS } from "@/types";

interface LeadsListContentProps {
  leads: (Lead & { assigned_agent?: { id: string; full_name: string; avatar_url: string | null } | null })[];
  agents: { id: string; full_name: string }[];
  currentFilters: {
    status?: string;
    source?: string;
    temperature?: string;
    search?: string;
    agent?: string;
  };
  userRole: UserRole;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  interested: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  site_visit_scheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  negotiation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  not_responding: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const tempColors: Record<string, string> = {
  hot: "bg-red-500 text-white",
  warm: "bg-amber-500 text-white",
  cold: "bg-blue-500 text-white",
};

export function LeadsListContent({ leads, agents, currentFilters, userRole }: LeadsListContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  function applyFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams();
    const filters = { ...currentFilters, [key]: value };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/leads?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("search", search || undefined);
  }

  function clearFilters() {
    router.push("/leads");
  }

  const hasFilters = Object.values(currentFilters).some(Boolean);

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Leads"
        description={`${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
        action={
          <Link href="/leads/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <div className="px-4 space-y-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <Button
            type="button"
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </form>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 animate-slide-up">
            <Select
              value={currentFilters.status || "all"}
              onValueChange={(v) => applyFilter("status", v === "all" || !v ? undefined : v)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.source || "all"}
              onValueChange={(v) => applyFilter("source", v === "all" || !v ? undefined : v)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.temperature || "all"}
              onValueChange={(v) => applyFilter("temperature", v === "all" || !v ? undefined : v)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Temperature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hot">🔥 Hot</SelectItem>
                <SelectItem value="warm">🌤 Warm</SelectItem>
                <SelectItem value="cold">❄️ Cold</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={currentFilters.agent || "all"}
              onValueChange={(v) => applyFilter("agent", v === "all" || !v ? undefined : v)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
            <X className="w-3 h-3 mr-1" /> Clear filters
          </Button>
        )}
      </div>

      {/* Lead Cards */}
      <div className="px-4 space-y-2">
        {leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads found"
            description={hasFilters ? "Try changing your filters" : "Add your first lead to get started"}
            action={
              <Link href="/leads/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Add Lead
                </Button>
              </Link>
            }
          />
        ) : (
          leads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm active:scale-[0.99] mb-2 py-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{lead.full_name}</h3>
                        {lead.temperature === "hot" && (
                          <Flame className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                      {lead.preferred_location && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          📍 {lead.preferred_location}
                          {lead.budget_max && ` • ₹${(lead.budget_max / 10000000).toFixed(1)}Cr`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className={`text-[10px] px-2 py-0.5 ${statusColors[lead.status] || ""}`}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 ${tempColors[lead.temperature]}`}>
                        {TEMPERATURE_LABELS[lead.temperature]}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{LEAD_SOURCE_LABELS[lead.source]}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {lead.assigned_agent && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {lead.assigned_agent.full_name.split(" ")[0]}
                        </Badge>
                      )}
                      {lead.next_followup_at && (
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
