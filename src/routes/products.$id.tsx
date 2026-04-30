import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-destructive">{error.message}</p>
        <Button onClick={() => { router.invalidate(); reset(); }} className="mt-4">Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary underline">Back to shop</Link>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="mx-auto max-w-7xl px-6 py-20 text-muted-foreground">Loading…</div>;
  if (!product) return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary underline">Back to shop</Link>
    </div>
  );

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl bg-muted">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wider text-primary">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-4 font-display text-3xl font-bold">${Number(product.price).toFixed(2)}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQty(Math.min(product.stock, qty + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 gap-2 shadow-[var(--shadow-elegant)]"
              disabled={!inStock}
              onClick={() => {
                add({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url }, qty);
                toast.success(`${product.name} added to cart`);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {inStock ? "Add to cart" : "Sold out"}
            </Button>
          </div>

          {inStock && product.stock < 10 && (
            <p className="mt-4 text-sm text-muted-foreground">Only {product.stock} left in stock.</p>
          )}
        </div>
      </div>
    </div>
  );
}
