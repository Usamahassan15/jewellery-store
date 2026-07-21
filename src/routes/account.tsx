import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/account")({
  component: Account,
});

function Account() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const { data: orders } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (loading) return null;
  if (!user) return <div className="min-h-screen"><SiteHeader /><div className="container-luxe py-24 text-center"><Link to="/auth" className="btn-gold rounded-full px-6 py-3">Sign in</Link></div><SiteFooter /></div>;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-4xl">My account</h1>
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
            className="text-sm text-muted-foreground hover:text-destructive">Sign out</button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{user.email}</div>

        <h2 className="mt-12 font-serif text-2xl">Orders</h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {(orders ?? []).length === 0 && <div className="py-16 text-center text-muted-foreground">No orders yet.</div>}
          {(orders ?? []).map((o: any) => (
            <div key={o.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <div className="font-medium">Order · {o.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                <div className="mt-1 text-xs">{(o.order_items ?? []).map((i: any) => `${i.product_name} × ${i.quantity}`).join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatPKR(o.total)}</div>
                <div className="text-xs uppercase tracking-wide text-gold">{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
