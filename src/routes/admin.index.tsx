import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = { revenue: number; orders: number; products: number; lowStock: number };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, products: 0, lowStock: 0 });
  const [recent, setRecent] = useState<{ id: string; total: number; created_at: string; shipping_name: string; status: string }[]>([]);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, created_at, shipping_name").order("created_at", { ascending: false }),
        supabase.from("products").select("id, stock"),
      ]);
      const orders = ordersRes.data ?? [];
      const products = productsRes.data ?? [];
      const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
      setStats({
        revenue,
        orders: orders.length,
        products: products.length,
        lowStock: products.filter((p) => p.stock < 10).length,
      });
      setRecent(orders.slice(0, 5));
    })();
  }, []);

  const cards = [
    { icon: DollarSign, label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, accent: "text-success" },
    { icon: ShoppingBag, label: "Orders", value: stats.orders, accent: "text-primary" },
    { icon: Package, label: "Products", value: stats.products, accent: "text-foreground" },
    { icon: TrendingUp, label: "Low stock", value: stats.lowStock, accent: "text-destructive" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className={`h-5 w-5 ${c.accent}`} />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Recent orders</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Status</th><th className="pb-3 text-right">Total</th></tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="py-3">{o.shipping_name}</td>
                  <td className="py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span></td>
                  <td className="py-3 text-right font-semibold">${Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
