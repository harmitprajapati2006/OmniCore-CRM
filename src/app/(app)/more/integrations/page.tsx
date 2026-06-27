"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MessageSquare, Mail, Brain, Webhook, Save } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationsPage() {
  return (
    <div className="animate-slide-up">
      <PageHeader title="Integrations" description="Configure external services" />
      <div className="px-4 space-y-4 pb-8">
        {/* Twilio */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Twilio Voice/SMS</CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Env Configured" : "Not Set"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Configure via environment variables for security. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local</p>
            <div className="space-y-2"><Label className="text-xs">Account SID</Label><Input placeholder="ACxxxxxxxx" className="h-10 font-mono text-xs" disabled value="Set in .env.local" /></div>
            <div className="space-y-2"><Label className="text-xs">Auth Token</Label><Input type="password" placeholder="••••••••" className="h-10" disabled value="Set in .env.local" /></div>
            <div className="space-y-2"><Label className="text-xs">Phone Number</Label><Input placeholder="+1234567890" className="h-10" disabled value="Set in .env.local" /></div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">WhatsApp</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">WhatsApp deep links work without API keys. For programmatic sending, configure Twilio WhatsApp or WhatsApp Cloud API in .env.local</p>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-base">Email (Resend)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Set RESEND_API_KEY in .env.local. Emails will be sent from the configured sender address.</p>
          </CardContent>
        </Card>

        {/* AI */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-base">AI (OpenAI-compatible)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Set OPENAI_API_KEY in .env.local. Used for caption generation and property descriptions. Compatible with any OpenAI-compatible API.</p>
          </CardContent>
        </Card>

        {/* Webhook */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base">Lead Webhook</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Endpoint for receiving leads from external platforms</p>
            <code className="text-xs bg-muted px-3 py-2 rounded-lg block">{`POST /api/webhooks/leads`}</code>
            <p className="text-xs text-muted-foreground">Set WEBHOOK_SECRET in .env.local and pass as Bearer token in Authorization header.</p>
            <div className="space-y-2">
              <Label className="text-xs">Assignment Mode</Label>
              <Select defaultValue="round_robin">
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="least_busy">Least Busy</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
