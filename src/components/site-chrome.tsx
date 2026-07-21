import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X, Search, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCartCount } from "@/hooks/use-cart-count";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/category/rings", label: "Rings" },
  { to: "/category/earrings", label: "Earrings" },
  { to: "/category/necklaces", label: "Necklaces" },
  { to: "/category/bridal", label: "Bridal" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const cartCount = useCartCount(user?.id);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container-luxe flex h-16 items-center justify-between gap-6">
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-wider">
            Zaira<span className="text-gold">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/70 transition-colors hover:text-gold"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="text-foreground/70 hover:text-foreground" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          {isAdmin && (
            <Link to="/admin" className="text-foreground/70 hover:text-gold" aria-label="Admin">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          <Link to={user ? "/account" : "/auth"} className="text-foreground/70 hover:text-foreground" aria-label="Account">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative text-foreground/70 hover:text-foreground" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="container-luxe flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn("py-2 text-sm text-foreground/80")}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container-luxe grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="font-serif text-2xl">Zaira<span className="text-gold">.</span></div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Fine jewellery, handcrafted with 22k & 18k gold and ethically sourced stones.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Shop</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/category/rings">Rings</Link></li>
            <li><Link to="/category/earrings">Earrings</Link></li>
            <li><Link to="/category/necklaces">Necklaces</Link></li>
            <li><Link to="/category/bridal">Bridal Sets</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Help</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about">About</Link></li>
            <li>Shipping & Returns</li>
            <li>Care Guide</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Newsletter</div>
          <p className="text-sm text-muted-foreground mb-3">New arrivals, in your inbox.</p>
          <div className="flex">
            <input placeholder="you@email.com" className="w-full rounded-l-md border border-border bg-background px-3 py-2 text-sm" />
            <button className="rounded-r-md btn-gold px-4 text-sm font-medium">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Zaira Jewels. All rights reserved.
      </div>
    </footer>
  );
}
