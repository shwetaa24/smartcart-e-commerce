import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_name: string;
  shipping_city: string;
  order_items: { id: string; product_name: string; product_image: string | null; quantity: number; unit_price: number }[];
};

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Your orders — SmartCart" }] }),
});

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/orders" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setFetching(false);
      });
  }, [user]);

  if (loading || fetching) return <div className="mx-auto max-w-md px-6 py-20 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold">Your orders</h1>
      <p className="mt-2 text-muted-foreground">Track every purchase you've made.</p>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your purchases will show up here.</p>
          <Link to="/products" className="mt-6"><Button>Start shopping</Button></Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                  <p className="mt-1 font-display font-semibold">
                    {new Date(o.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    o.status === "delivered" ? "bg-success/15 text-success" :
                    o.status === "shipped" ? "bg-primary/15 text-primary" :
                    o.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {o.status}
                  </span>
                  <p className="mt-1 font-display text-lg font-bold">${Number(o.total).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {o.order_items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {it.product_image && <img src={it.product_image} alt={it.product_name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{it.product_name}</p>
                      <p className="text-muted-foreground">Qty {it.quantity} · ${Number(it.unit_price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
