import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
      if (!cat) return { cat: null, products: [] as any[] };
      const { data: products } = await supabase.from("products").select("*").eq("category_id", cat.id);
      return { cat, products: products ?? [] };
    },
  });
  const cat = data?.cat;
  const products = data?.products ?? [];
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe py-12">
        <h1 className="font-serif text-4xl">{cat?.name ?? "Category"}</h1>
        <p className="mt-2 text-muted-foreground">{products.length} pieces</p>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        {products.length === 0 && <div className="py-24 text-center text-muted-foreground">No products yet.</div>}
      </div>
      <SiteFooter />
    </div>
  );
}
