import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Building2, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { PROPERTY_TYPE_LABELS, AVAILABILITY_LABELS } from "@/types";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: properties } = await supabase
    .from("properties")
    .select("*, images:property_images(id, url, is_primary, sort_order)")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  const formatPrice = (price: number | null) => {
    if (!price) return "Price on request";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const availColors: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    hold: "bg-amber-100 text-amber-700",
    sold: "bg-red-100 text-red-700",
    rented: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="animate-slide-up">
      <PageHeader
        title="Properties"
        description={`${properties?.length || 0} listings`}
        action={
          <Link href="/properties/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </Link>
        }
      />

      <div className="px-4 space-y-3">
        {!properties?.length ? (
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Add your first property listing"
            action={
              <Link href="/properties/new">
                <Button><Plus className="w-4 h-4 mr-2" /> Add Property</Button>
              </Link>
            }
          />
        ) : (
          properties.map((property) => {
            const primaryImage = property.images?.find((img: { is_primary: boolean }) => img.is_primary) || property.images?.[0];
            return (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99] mb-1 py-0">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-28 h-28 md:w-36 md:h-32 bg-muted shrink-0 relative">
                        {primaryImage ? (
                          <img src={primaryImage.url} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className={`absolute top-2 left-2 text-[10px] px-1.5 py-0 ${availColors[property.availability]}`}>
                          {AVAILABILITY_LABELS[property.availability as keyof typeof AVAILABILITY_LABELS]}
                        </Badge>
                      </div>
                      {/* Info */}
                      <div className="p-3 flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold truncate">{property.title}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {property.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{formatPrice(property.price)}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {PROPERTY_TYPE_LABELS[property.property_type as keyof typeof PROPERTY_TYPE_LABELS]}
                            </Badge>
                            {property.bedrooms ? (
                              <span className="flex items-center gap-0.5">
                                <Bed className="w-3 h-3" /> {property.bedrooms}
                              </span>
                            ) : null}
                            {property.bathrooms ? (
                              <span className="flex items-center gap-0.5">
                                <Bath className="w-3 h-3" /> {property.bathrooms}
                              </span>
                            ) : null}
                            {property.size_sqft ? (
                              <span className="flex items-center gap-0.5">
                                <Maximize className="w-3 h-3" /> {property.size_sqft} sqft
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
