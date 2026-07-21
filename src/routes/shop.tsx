import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — Zaira" }, { name: "description", content: "Browse the full Zaira jewellery collection." }] }),
  component: ShopPage,
});

function ShopPage() {
  const { data: products } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe py-12">
        <h1 className="font-serif text-4xl">Shop all</h1>
        <p className="mt-2 text-muted-foreground">The complete Zaira collection.</p>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {(products ?? []).map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
