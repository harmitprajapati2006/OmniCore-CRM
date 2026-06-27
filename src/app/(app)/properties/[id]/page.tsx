import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize, Building2,
  Share2, Phone, Layers, Home, IndianRupee
} from "lucide-react";
import { PROPERTY_TYPE_LABELS, AVAILABILITY_LABELS } from "@/types";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: property } = await supabase
    .from("properties")
    .select("*, images:property_images(*), documents:property_documents(*)")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!property) notFound();

  const formatPrice = (price: number | null) => {
    if (!price) return "Price on request";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)} Lakhs`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const availColors: Record<string, string> = {
    available: "bg-green-100 text-green-700", hold: "bg-amber-100 text-amber-700",
    sold: "bg-red-100 text-red-700", rented: "bg-blue-100 text-blue-700",
  };

  const sortedImages = (property.images || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

  return (
    <div className="animate-slide-up pb-8">
      <div className="px-4 pt-4">
        <Link href="/properties">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Properties
          </Button>
        </Link>
      </div>

      {/* Image Gallery */}
      {sortedImages.length > 0 && (
        <div className="overflow-x-auto flex gap-2 px-4 pb-4 snap-x snap-mandatory">
          {sortedImages.map((img: { id: string; url: string; caption: string | null }) => (
            <div key={img.id} className="snap-center shrink-0 w-72 h-48 md:w-96 md:h-64 rounded-xl overflow-hidden bg-muted">
              <img src={img.url} alt={img.caption || property.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Title & Price */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold">{property.title}</h1>
            <Badge className={`shrink-0 ${availColors[property.availability]}`}>
              {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {property.address || property.location}
          </p>
          <p className="text-2xl font-bold text-primary mt-2">{formatPrice(property.price)}</p>
          {property.price_per_sqft && (
            <p className="text-xs text-muted-foreground">₹{property.price_per_sqft.toLocaleString()}/sqft</p>
          )}
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Bed, label: "Beds", value: property.bedrooms },
            { icon: Bath, label: "Baths", value: property.bathrooms },
            { icon: Maximize, label: "Size", value: property.size_sqft ? `${property.size_sqft}` : null },
            { icon: Layers, label: "Floor", value: property.floor ? `${property.floor}/${property.total_floors || ""}` : null },
          ].map((spec) => spec.value ? (
            <Card key={spec.label} className="border-0 shadow-sm py-0">
              <CardContent className="p-3 text-center">
                <spec.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-bold">{spec.value}</p>
                <p className="text-[10px] text-muted-foreground">{spec.label}</p>
              </CardContent>
            </Card>
          ) : null)}
        </div>

        {/* Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium">{PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS]}</p></div>
            <div><span className="text-muted-foreground text-xs">Furnishing</span><p className="font-medium capitalize">{property.furnishing?.replace("_", " ") || "—"}</p></div>
            {property.developer_name && <div><span className="text-muted-foreground text-xs">Developer</span><p className="font-medium">{property.developer_name}</p></div>}
            {property.project_name && <div><span className="text-muted-foreground text-xs">Project</span><p className="font-medium">{property.project_name}</p></div>}
            {property.units_available && <div><span className="text-muted-foreground text-xs">Units Available</span><p className="font-medium">{property.units_available}</p></div>}
            {property.rera_number && <div><span className="text-muted-foreground text-xs">RERA</span><p className="font-medium">{property.rera_number}</p></div>}
          </CardContent>
        </Card>

        {/* Description */}
        {property.description && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p></CardContent>
          </Card>
        )}

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Amenities</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {property.amenities.map((a: string) => (
                <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Owner Info */}
        {property.owner_name && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Owner/Developer</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{property.owner_name}</p>
                {property.owner_phone && <p className="text-xs text-muted-foreground">{property.owner_phone}</p>}
              </div>
              {property.owner_phone && (
                <a href={`tel:${property.owner_phone}`}>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Share Link */}
        {property.share_slug && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Public Share Link</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                {typeof window !== "undefined" ? window.location.origin : ""}/share/{property.share_slug}
              </code>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
