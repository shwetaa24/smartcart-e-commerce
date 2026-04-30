import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Your cart — SmartCart" }] }),
});

function CartPage() {
  const { items, update, remove, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a few things to get started.</p>
        <Link to="/products" className="mt-6">
          <Button size="lg">Start shopping</Button>
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold">Your cart</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {it.image_url && <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <Link to="/products/$id" params={{ id: it.id }} className="font-display font-semibold hover:underline">
                  {it.name}
                </Link>
                <p className="text-sm text-muted-foreground">${it.price.toFixed(2)}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-border">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => update(it.id, it.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{it.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => update(it.id, it.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-display font-bold">${(it.price * it.quantity).toFixed(2)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(it.id)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd></div>
            <div className="my-3 border-t border-border" />
            <div className="flex justify-between font-display text-lg font-bold"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
          </dl>
          <Link to="/checkout">
            <Button className="mt-6 w-full shadow-[var(--shadow-elegant)]" size="lg">Checkout</Button>
          </Link>
          {subtotal < 50 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Add ${(50 - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
