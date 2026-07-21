import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Zaira" }, { name: "description", content: "The story behind Zaira: handcrafted fine jewellery from Pakistan." }] }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe py-16 max-w-3xl">
        <h1 className="font-serif text-5xl">Our story</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Zaira was born from a simple idea: heirloom-quality jewellery, made honestly, made beautifully.
          Every piece is crafted in our Lahore atelier using ethically sourced gold and hand-picked stones.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          From delicate everyday studs to statement bridal sets, our collection celebrates the quiet
          confidence of women who wear jewellery for themselves — first and always.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
