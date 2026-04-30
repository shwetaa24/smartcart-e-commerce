import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard, type Product } from "@/components/ProductCard";

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    category: (s.category as string) || "",
  }),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Shop all — SmartCart" },
      { name: "description", content: "Browse the full SmartCart collection. Search and filter by category." },
    ],
  }),
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(search.q);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (search.category && p.category !== search.category) return false;
      if (q && !p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [products, query, search.category]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Shop all</h1>
        <p className="mt-2 text-muted-foreground">{products.length} products curated for you.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!search.category ? "default" : "outline"}
            onClick={() => navigate({ search: { q: query, category: "" } })}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={search.category === c ? "default" : "outline"}
              onClick={() => navigate({ search: { q: query, category: c } })}
              className="capitalize"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
