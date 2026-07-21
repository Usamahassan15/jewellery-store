import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { HeroSpinSlider } from "@/components/hero-spin-slider";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Gem, Shield, Truck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("featured", true).limit(6);
      return data ?? [];
    },
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO with 3D rotating jewellery */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(220,180,90,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(220,180,90,0.15), transparent 40%)",
        }} />
        <div className="container-luxe relative grid gap-8 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center text-background">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Zaira · Est. 2024</span>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              Timeless jewellery,<br />
              <span className="text-gold italic">crafted for you.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-background/70">
              Handcrafted 22k & 18k gold, ethically sourced diamonds, and heirloom-worthy bridal sets — designed in Pakistan, worn everywhere.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-gold hover:btn-gold-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/category/bridal" className="inline-flex items-center gap-2 rounded-full border border-background/30 px-6 py-3 text-sm font-medium text-background hover:bg-background/10">
                Bridal
              </Link>
            </div>
          </div>
          <div className="relative">
            <HeroSpinSlider />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-border/60 bg-background">
        <div className="container-luxe grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
          {[
            { icon: Gem, title: "Certified fine jewellery", desc: "Hallmarked gold & GIA diamonds" },
            { icon: Truck, title: "Free insured shipping", desc: "On orders over PKR 25,000" },
            { icon: Shield, title: "Lifetime maintenance", desc: "Complimentary cleaning & re-polish" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-luxe py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">Shop by category</h2>
            <p className="mt-2 text-muted-foreground">Every piece, a chapter of a longer story.</p>
          </div>
          <Link to="/shop" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {(categories ?? []).map((c: any) => (
            <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary/60">
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink/70 via-transparent to-transparent p-4">
                <span className="font-serif text-xl text-background transition-transform group-hover:-translate-y-1">{c.name}</span>
              </div>
              <div className="absolute inset-0 -z-0 flex items-center justify-center opacity-70 transition-opacity group-hover:opacity-100">
                <div className="text-6xl">✦</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-luxe pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">Featured pieces</h2>
            <p className="mt-2 text-muted-foreground">Handpicked for this season.</p>
          </div>
          <Link to="/shop" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {(featured ?? []).map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
