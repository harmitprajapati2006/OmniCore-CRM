"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LEAD_SOURCE_LABELS, PROPERTY_TYPE_LABELS } from "@/types";
import Link from "next/link";

interface AddLeadFormProps {
  organizationId: string;
  agents: { id: string; full_name: string }[];
}

export function AddLeadForm({ organizationId, agents }: AddLeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      organization_id: organizationId,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || null,
      source: formData.get("source") as string || "manual",
      property_type: (formData.get("property_type") as string) || null,
      budget_min: formData.get("budget_min") ? Number(formData.get("budget_min")) : null,
      budget_max: formData.get("budget_max") ? Number(formData.get("budget_max")) : null,
      preferred_location: (formData.get("preferred_location") as string) || null,
      assigned_agent_id: (formData.get("assigned_agent_id") as string) || null,
      temperature: (formData.get("temperature") as string) || "warm",
      notes: (formData.get("notes") as string) || null,
      status: "new" as const,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("leads").insert(data);

      if (error) {
        toast.error("Failed to create lead: " + error.message);
        return;
      }

      // Create activity
      await supabase.from("activities").insert({
        organization_id: organizationId,
        type: "lead_created",
        title: `New lead: ${data.full_name}`,
        description: `Lead added from ${LEAD_SOURCE_LABELS[data.source as keyof typeof LEAD_SOURCE_LABELS] || data.source}`,
      });

      toast.success("Lead created successfully!");
      router.push("/leads");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Add New Lead"
        action={
          <Link href="/leads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="px-4 space-y-4 pb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" required placeholder="Rahul Sharma" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" type="tel" required placeholder="+919999999999" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="rahul@example.com" className="h-12" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select name="source" defaultValue="manual">
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select name="property_type">
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Min Budget (₹)</Label>
                <Input id="budget_min" name="budget_min" type="number" placeholder="5000000" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Max Budget (₹)</Label>
                <Input id="budget_max" name="budget_max" type="number" placeholder="15000000" className="h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_location">Preferred Location</Label>
              <Input id="preferred_location" name="preferred_location" placeholder="Gurgaon" className="h-12" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Select name="temperature" defaultValue="warm">
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">🔥 Hot</SelectItem>
                    <SelectItem value="warm">🌤 Warm</SelectItem>
                    <SelectItem value="cold">❄️ Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign Agent</Label>
                <Select name="assigned_agent_id">
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Auto-assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Looking for 3BHK near Golf Course Road" rows={3} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Lead
        </Button>
      </form>
    </div>
  );
}
