import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProductCard, type Product } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SmartCart — Modern essentials, delivered" },
      { name: "description", content: "Curated tech, audio, and lifestyle essentials. Fast checkout. Real tracking." },
    ],
  }),
});

function Index() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("featured", true)
      .limit(4)
      .then(({ data }) => setFeatured((data as Product[]) ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-soft)]" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-glow/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> New season drop
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Things you'll <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">actually use</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              SmartCart curates the gear, audio and accessories worth your bag space. No filler.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="gap-2 shadow-[var(--shadow-elegant)]">
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products" search={{ q: "", category: "audio" }}>
                <Button size="lg" variant="outline">Browse audio</Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { icon: Truck, label: "Free shipping", sub: "On orders $50+" },
                { icon: ShieldCheck, label: "2-yr warranty", sub: "Every product" },
                { icon: Sparkles, label: "Hand-picked", sub: "By real humans" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <f.icon className="mb-1 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] shadow-[var(--shadow-elegant)]">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000"
                alt="Featured headphones"
                className="h-full w-full object-cover mix-blend-luminosity opacity-90"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <p className="text-xs text-muted-foreground">Best seller</p>
              <p className="font-display font-semibold">Aurora Headphones</p>
              <p className="font-display text-lg font-bold text-primary">$249</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Featured</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">This week's picks</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline-flex">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
