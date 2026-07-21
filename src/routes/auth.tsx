import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
      });
      if (error) toast.error(error.message);
      else { toast.success("Account created!"); nav({ to: "/" }); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else { toast.success("Welcome back"); nav({ to: "/" }); }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-luxe grid place-items-center py-16">
        <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-serif text-3xl">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue shopping." : "Join Zaira in a moment."}
          </p>
          <div className="mt-6 grid gap-3">
            {mode === "signup" && (
              <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            )}
            <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              minLength={6} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            <button disabled={loading} className="btn-gold hover:btn-gold-hover rounded-full py-2.5 text-sm font-medium disabled:opacity-60">
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </div>
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}
