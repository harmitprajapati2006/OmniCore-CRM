import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Bed, Bath, Maximize, Phone } from "lucide-react";
import { PROPERTY_TYPE_LABELS } from "@/types";

export default async function PublicPropertySharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*, images:property_images(*), organizations(name, phone)")
    .eq("share_slug", slug)
    .single();

  if (!property) notFound();

  const org = property.organizations as { name: string; phone: string | null } | null;
  const formatPrice = (price: number | null) => {
    if (!price) return "Price on request";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)} Lakhs`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const sortedImages = (property.images || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b px-4 py-3">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">{org?.name || "EstateFlow"}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        {/* Images */}
        {sortedImages.length > 0 && (
          <div className="overflow-x-auto flex gap-2 p-4 snap-x snap-mandatory">
            {sortedImages.map((img: { id: string; url: string; caption: string | null }) => (
              <div key={img.id} className="snap-center shrink-0 w-80 h-56 rounded-xl overflow-hidden bg-muted">
                <img src={img.url} alt={img.caption || property.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="px-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" /> {property.address || property.location}
            </p>
            <p className="text-3xl font-bold text-primary mt-3">{formatPrice(property.price)}</p>
            <Badge className="mt-2">{PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS]}</Badge>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3">
            {property.bedrooms && (
              <Card className="border-0 shadow-sm py-0"><CardContent className="p-3 text-center"><Bed className="w-5 h-5 mx-auto text-muted-foreground mb-1" /><p className="text-lg font-bold">{property.bedrooms}</p><p className="text-xs text-muted-foreground">Bedrooms</p></CardContent></Card>
            )}
            {property.bathrooms && (
              <Card className="border-0 shadow-sm py-0"><CardContent className="p-3 text-center"><Bath className="w-5 h-5 mx-auto text-muted-foreground mb-1" /><p className="text-lg font-bold">{property.bathrooms}</p><p className="text-xs text-muted-foreground">Bathrooms</p></CardContent></Card>
            )}
            {property.size_sqft && (
              <Card className="border-0 shadow-sm py-0"><CardContent className="p-3 text-center"><Maximize className="w-5 h-5 mx-auto text-muted-foreground mb-1" /><p className="text-lg font-bold">{property.size_sqft}</p><p className="text-xs text-muted-foreground">Sq. Ft.</p></CardContent></Card>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4"><p className="text-sm leading-relaxed">{property.description}</p></CardContent>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a: string) => <Badge key={a} variant="secondary">{a}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Sticky CTA */}
      {org?.phone && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t p-4 safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-3">
            <a href={`tel:${org.phone}`} className="flex-1">
              <button className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" /> Call Now
              </button>
            </a>
            <a href={`https://wa.me/${org.phone?.replace(/[^\d+]/g, "")}`} target="_blank" className="flex-1">
              <button className="w-full h-12 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                WhatsApp
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
