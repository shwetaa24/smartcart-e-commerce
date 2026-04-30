import { Link } from "@tanstack/react-router";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  featured: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-xl font-bold">${Number(product.price).toFixed(2)}</span>
          {product.stock <= 0 ? (
            <span className="text-xs font-medium text-destructive">Sold out</span>
          ) : product.stock < 10 ? (
            <span className="text-xs font-medium text-muted-foreground">{product.stock} left</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
