import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { formatPKR, resolveImage } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

type Tab = "products" | "orders";

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("products");

  if (loading) return null;
  if (!user) return <div className="min-h-screen"><SiteHeader /><div className="container-luxe py-24 text-center"><Link to="/auth" className="btn-gold rounded-full px-6 py-3">Sign in</Link></div><SiteFooter /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen"><SiteHeader />
      <div className="container-luxe py-24 text-center">
        <h1 className="font-serif text-3xl">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your user id: <code className="rounded bg-secondary px-2 py-1">{user.id}</code></p>
        <p className="mt-4 max-w-md mx-auto text-sm text-muted-foreground">
          Ask your project owner to insert a row into <code>user_roles</code> with your user id and role <code>admin</code>.
        </p>
      </div>
      <SiteFooter />
    </div>
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe py-10">
        <h1 className="font-serif text-4xl">Admin</h1>
        <div className="mt-6 flex gap-2 border-b border-border">
          {(["products", "orders"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-gold text-foreground" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
        <div className="mt-8">{tab === "products" ? <ProductsAdmin /> : <OrdersAdmin />}</div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ProductsAdmin() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => (await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false })).data ?? [],
  });

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "products"] }); }
  }

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="btn-gold rounded-full px-5 py-2 text-sm inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>
      {showAdd && <AddProduct onDone={() => { setShowAdd(false); qc.invalidateQueries({ queryKey: ["admin", "products"] }); }} />}
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {(products ?? []).map((p: any) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <img src={resolveImage(p.image_url)} alt="" className="h-14 w-14 rounded bg-secondary/60 object-contain p-1" />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.category?.name} · Stock: {p.stock} · {p.featured ? "Featured" : "Standard"}</div>
            </div>
            <div className="text-sm font-medium">{formatPKR(p.price)}</div>
            <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddProduct({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: "", slug: "", price: "", description: "", image_url: "", category_id: "", stock: "10", featured: false });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: async () => (await supabase.from("categories").select("*")).data ?? [] });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("products").insert({
      name: f.name, slug: f.slug || f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(f.price), description: f.description, image_url: f.image_url,
      category_id: f.category_id || null, stock: Number(f.stock), featured: f.featured,
    });
    if (error) toast.error(error.message);
    else { toast.success("Added"); onDone(); }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="mt-4 grid gap-3 rounded-xl border border-border bg-secondary/30 p-6 md:grid-cols-2">
      <Input label="Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} required />
      <Input label="Slug (optional)" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} />
      <Input label="Price (PKR)" type="number" value={f.price} onChange={(v) => setF({ ...f, price: v })} required />
      <Input label="Stock" type="number" value={f.stock} onChange={(v) => setF({ ...f, stock: v })} />
      <Input label="Image URL" value={f.image_url} onChange={(v) => setF({ ...f, image_url: v })} />
      <label className="grid gap-1.5 text-sm">
        <span className="text-muted-foreground">Category</span>
        <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2">
          <option value="">—</option>
          {(categories ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label className="col-span-full grid gap-1.5 text-sm">
        <span className="text-muted-foreground">Description</span>
        <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })}
          className="min-h-20 rounded-md border border-border bg-background px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Featured
      </label>
      <div className="col-span-full flex justify-end">
        <button disabled={saving} className="btn-gold rounded-full px-5 py-2 text-sm">{saving ? "Saving…" : "Save product"}</button>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} required={required}
        className="rounded-md border border-border bg-background px-3 py-2" />
    </label>
  );
}

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [],
  });
  const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); }
  }
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {(orders ?? []).length === 0 && <div className="py-16 text-center text-muted-foreground">No orders yet.</div>}
      {(orders ?? []).map((o: any) => (
        <div key={o.id} className="grid gap-2 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <div className="font-medium">{o.customer_name} · {o.phone}</div>
            <div className="text-xs text-muted-foreground">{o.address}, {o.city}</div>
            <div className="mt-1 text-xs">{(o.order_items ?? []).map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ")}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
          </div>
          <div className="text-right font-medium">{formatPKR(o.total)}</div>
          <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm">
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}
