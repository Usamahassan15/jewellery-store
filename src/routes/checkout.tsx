import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { formatPKR } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", address: "", city: "", notes: "" });

  const { data: items } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("cart_items").select("id, quantity, product:products(*)").eq("user_id", user!.id)).data ?? [],
  });

  if (loading) return null;
  if (!user) return <div className="min-h-screen"><SiteHeader /><div className="container-luxe py-24 text-center"><Link to="/auth" className="btn-gold rounded-full px-6 py-3">Sign in to check out</Link></div><SiteFooter /></div>;

  const list = items ?? [];
  const total = list.reduce((s, r: any) => s + Number(r.product?.price ?? 0) * r.quantity, 0);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (list.length === 0) return;
    if (!form.customer_name || !form.phone || !form.address || !form.city) {
      toast.error("Please fill all required fields"); return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user!.id, total, ...form,
    }).select().single();
    if (error || !order) { toast.error(error?.message ?? "Order failed"); setSubmitting(false); return; }
    const orderItems = list.map((r: any) => ({
      order_id: order.id, product_id: r.product?.id, product_name: r.product?.name, price: r.product?.price, quantity: r.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user!.id);
    toast.success("Order placed!");
    nav({ to: "/account" });
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <form onSubmit={placeOrder} className="container-luxe grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="font-serif text-4xl">Checkout</h1>
          <p className="mt-2 text-muted-foreground">Cash on delivery. We'll confirm your order by phone.</p>
          <div className="mt-8 grid gap-4">
            {[
              { k: "customer_name", label: "Full name" },
              { k: "phone", label: "Phone number" },
              { k: "address", label: "Delivery address" },
              { k: "city", label: "City" },
              { k: "notes", label: "Order notes (optional)", optional: true },
            ].map((f) => (
              <label key={f.k} className="grid gap-1.5">
                <span className="text-sm text-muted-foreground">{f.label}</span>
                <input
                  required={!f.optional}
                  value={(form as any)[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold/40"
                />
              </label>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-secondary/40 p-6">
          <div className="font-serif text-xl">Summary</div>
          <div className="mt-6 space-y-2 text-sm">
            {list.map((r: any) => (
              <div key={r.id} className="flex justify-between">
                <span>{r.product?.name} × {r.quantity}</span>
                <span>{formatPKR(Number(r.product?.price ?? 0) * r.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-medium"><span>Total</span><span>{formatPKR(total)}</span></div>
          <button disabled={submitting || list.length === 0} className="mt-6 w-full btn-gold hover:btn-gold-hover rounded-full py-3 text-sm font-medium disabled:opacity-50">
            {submitting ? "Placing…" : "Place order (COD)"}
          </button>
        </aside>
      </form>
      <SiteFooter />
    </div>
  );
}
