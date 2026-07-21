import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCartCount(userId: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) { setCount(0); return; }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("cart_items").select("quantity").eq("user_id", userId);
      if (cancelled) return;
      setCount((data ?? []).reduce((s, r: any) => s + r.quantity, 0));
    };
    load();
    const ch = supabase.channel("cart-count-" + userId)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [userId]);

  return count;
}
