import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { formatPKR, resolveImage } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(*)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  async function updateQty(id: string, quantity: number) {
    if (quantity <= 0) { await supabase.from("cart_items").delete().eq("id", id); }
    else { await supabase.from("cart_items").update({ quantity }).eq("id", id); }
    qc.invalidateQueries({ queryKey: ["cart", user?.id] });
  }

  if (loading) return <div className="min-h-screen"><SiteHeader /><div className="container-luxe py-24 text-center text-muted-foreground">Loading…</div><SiteFooter /></div>;
  if (!user) return (
    <div className="min-h-screen"><SiteHeader />
      <div className="container-luxe py-24 text-center">
        <h1 className="font-serif text-3xl">Sign in to see your cart</h1>
        <Link to="/auth" className="mt-6 inline-block btn-gold rounded-full px-6 py-3 text-sm font-medium">Sign in</Link>
      </div>
      <SiteFooter />
    </div>
  );

  const list = items ?? [];
  const subtotal = list.reduce((s, r: any) => s + Number(r.product?.price ?? 0) * r.quantity, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="font-serif text-4xl">Your cart</h1>
          <div className="mt-8 divide-y divide-border">
            {list.length === 0 && <div className="py-16 text-center text-muted-foreground">Your cart is empty.</div>}
            {list.map((r: any) => (
              <div key={r.id} className="flex gap-4 py-4">
                <img src={resolveImage(r.product?.image_url)} alt={r.product?.name} className="h-24 w-24 rounded-md bg-secondary/60 object-contain p-2" />
                <div className="flex flex-1 flex-col">
                  <div className="font-serif text-lg">{r.product?.name}</div>
                  <div className="text-sm text-muted-foreground">{formatPKR(r.product?.price ?? 0)}</div>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button className="p-2" onClick={() => updateQty(r.id, r.quantity - 1)}><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm">{r.quantity}</span>
                      <button className="p-2" onClick={() => updateQty(r.id, r.quantity + 1)}><Plus className="h-3 w-3" /></button>
                    </div>
                    <button className="text-muted-foreground hover:text-destructive" onClick={() => updateQty(r.id, 0)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="font-medium">{formatPKR(Number(r.product?.price ?? 0) * r.quantity)}</div>
              </div>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-secondary/40 p-6">
          <div className="font-serif text-xl">Order summary</div>
          <div className="mt-6 flex justify-between text-sm"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span>Shipping</span><span className="text-muted-foreground">Calculated at checkout</span></div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium"><span>Total</span><span>{formatPKR(subtotal)}</span></div>
          <button
            disabled={list.length === 0}
            onClick={() => nav({ to: "/checkout" })}
            className="mt-6 w-full btn-gold hover:btn-gold-hover rounded-full py-3 text-sm font-medium disabled:opacity-50"
          >
            Checkout
          </button>
        </aside>
      </div>
      <SiteFooter />
    </div>
  );
}
