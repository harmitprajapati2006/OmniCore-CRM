import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="animate-slide-up">
      <PageHeader title="Settings" />
      <div className="px-4 space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label className="text-sm font-medium">Push Notifications</Label><p className="text-xs text-muted-foreground">Receive push notifications</p></div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-sm font-medium">Sound Alerts</Label><p className="text-xs text-muted-foreground">Play sound for new leads</p></div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label className="text-sm font-medium">Dark Mode</Label><p className="text-xs text-muted-foreground">Use dark theme</p></div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Lead Assignment</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Default mode: <span className="font-medium text-foreground">Round Robin</span></p>
            <p className="text-xs text-muted-foreground mt-2">Configure in Integrations page</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">EstateFlow CRM</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
