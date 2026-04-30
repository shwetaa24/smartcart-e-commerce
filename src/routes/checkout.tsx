import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — SmartCart" }] }),
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "" });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="mx-auto max-w-md px-6 py-20 text-muted-foreground">Loading…</div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p>Your cart is empty.</p>
        <Link to="/products" className="mt-4 inline-block text-primary underline">Continue shopping</Link>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 8;
  const total = subtotal + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          status: "paid",
          shipping_name: form.name,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_zip: form.zip,
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((it) => ({
          order_id: order.id,
          product_id: it.id,
          product_name: it.name,
          product_image: it.image_url,
          unit_price: it.price,
          quantity: it.quantity,
        }))
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed!");
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold">Checkout</h1>
      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Shipping details</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="zip">ZIP / Postal</Label>
                <Input id="zip" required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Demo store — no real payment is processed. Order is marked as paid for demo purposes.
          </p>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span className="text-muted-foreground">{it.name} × {it.quantity}</span>
                <span>${(it.price * it.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="mt-2 flex justify-between font-display text-lg font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <Button type="submit" className="w-full shadow-[var(--shadow-elegant)]" size="lg" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
