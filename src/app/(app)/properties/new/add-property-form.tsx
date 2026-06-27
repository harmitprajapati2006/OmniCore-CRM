"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { PROPERTY_TYPE_LABELS } from "@/types";

interface AddPropertyFormProps {
  organizationId: string;
}

export function AddPropertyForm({ organizationId }: AddPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amenitiesText, setAmenitiesText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const amenities = amenitiesText.split(",").map(a => a.trim()).filter(Boolean);
    const slug = (formData.get("title") as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + "-" + Date.now().toString(36);

    const data = {
      organization_id: organizationId,
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      address: (formData.get("address") as string) || null,
      property_type: formData.get("property_type") as string,
      price: formData.get("price") ? Number(formData.get("price")) : null,
      size_sqft: formData.get("size_sqft") ? Number(formData.get("size_sqft")) : null,
      bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null,
      bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
      floor: formData.get("floor") ? Number(formData.get("floor")) : null,
      total_floors: formData.get("total_floors") ? Number(formData.get("total_floors")) : null,
      furnishing: (formData.get("furnishing") as string) || "unfurnished",
      availability: "available" as const,
      description: (formData.get("description") as string) || null,
      amenities,
      developer_name: (formData.get("developer_name") as string) || null,
      project_name: (formData.get("project_name") as string) || null,
      owner_name: (formData.get("owner_name") as string) || null,
      owner_phone: (formData.get("owner_phone") as string) || null,
      units_available: formData.get("units_available") ? Number(formData.get("units_available")) : 1,
      share_slug: slug,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("properties").insert(data);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Property created!");
      router.push("/properties");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-slide-up">
      <PageHeader title="Add Property" action={<Link href="/properties"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>} />
      <form onSubmit={handleSubmit} className="px-4 space-y-4 pb-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input name="title" required placeholder="Luxury 3BHK in DLF Phase 5" className="h-12" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Location *</Label><Input name="location" required placeholder="Gurgaon" className="h-12" /></div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select name="property_type" defaultValue="apartment">
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" placeholder="Full address" className="h-12" /></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Specs & Price</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Price (₹)</Label><Input name="price" type="number" placeholder="15000000" className="h-12" /></div>
              <div className="space-y-2"><Label>Size (sqft)</Label><Input name="size_sqft" type="number" placeholder="1800" className="h-12" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Beds</Label><Input name="bedrooms" type="number" placeholder="3" className="h-12" /></div>
              <div className="space-y-2"><Label>Baths</Label><Input name="bathrooms" type="number" placeholder="2" className="h-12" /></div>
              <div className="space-y-2">
                <Label>Furnishing</Label>
                <Select name="furnishing" defaultValue="unfurnished">
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
                    <SelectItem value="fully_furnished">Fully Furnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Floor</Label><Input name="floor" type="number" className="h-12" /></div>
              <div className="space-y-2"><Label>Total Floors</Label><Input name="total_floors" type="number" className="h-12" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Additional Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Description</Label><Textarea name="description" placeholder="Property description..." rows={3} /></div>
            <div className="space-y-2"><Label>Amenities (comma separated)</Label><Input value={amenitiesText} onChange={(e) => setAmenitiesText(e.target.value)} placeholder="Pool, Gym, Parking, Security" className="h-12" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Developer</Label><Input name="developer_name" className="h-12" /></div>
              <div className="space-y-2"><Label>Project</Label><Input name="project_name" className="h-12" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Owner Name</Label><Input name="owner_name" className="h-12" /></div>
              <div className="space-y-2"><Label>Owner Phone</Label><Input name="owner_phone" className="h-12" /></div>
            </div>
            <div className="space-y-2"><Label>Units Available</Label><Input name="units_available" type="number" defaultValue={1} className="h-12" /></div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Property
        </Button>
      </form>
    </div>
  );
}
