import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { formatPKR, resolveImage } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await supabase.from("products").select("*").eq("slug", slug).maybeSingle()).data,
  });

  async function addToCart() {
    if (!user) { nav({ to: "/auth", search: { redirect: `/product/${slug}` } as any }); return; }
    if (!product) return;
    setAdding(true);
    const { data: existing } = await supabase.from("cart_items").select("*")
      .eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: qty });
    }
    setAdding(false);
    toast.success("Added to cart");
  }

  if (!product) return (
    <div className="min-h-screen"><SiteHeader />
      <div className="container-luxe py-24 text-center text-muted-foreground">Loading…</div>
      <SiteFooter />
    </div>
  );

  const img = resolveImage(product.image_url);
  const price = Number(product.price);
  const compare = product.compare_at_price ? Number(product.compare_at_price) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe grid gap-10 py-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/60">
          {img && <img src={img} alt={product.name} className="h-full w-full object-contain p-10 animate-float" />}
        </div>
        <div className="flex flex-col">
          <h1 className="font-serif text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatPKR(price)}</span>
            {compare && compare > price && <span className="text-muted-foreground line-through">{formatPKR(compare)}</span>}
          </div>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border">
              <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center">{qty}</span>
              <button className="p-3" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={addToCart} disabled={adding} className="btn-gold hover:btn-gold-hover inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60">
              <ShoppingBag className="h-4 w-4" /> {adding ? "Adding…" : "Add to cart"}
            </button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free insured shipping</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Lifetime maintenance</div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
