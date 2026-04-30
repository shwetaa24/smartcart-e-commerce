import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

type Order = {
  id: string;
  total: number;
  status: Status;
  created_at: string;
  shipping_name: string;
  shipping_city: string;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number }[];
};

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">#{o.id.slice(0, 8)}</p>
              <p className="font-display font-semibold">{o.shipping_name} · {o.shipping_city}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-display text-lg font-bold">${Number(o.total).toFixed(2)}</p>
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as Status)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
            {o.order_items.map((it) => (
              <li key={it.id}>{it.product_name} × {it.quantity} — ${Number(it.unit_price).toFixed(2)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
