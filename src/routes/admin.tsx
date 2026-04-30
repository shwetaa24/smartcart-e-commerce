import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Package, ShoppingBag, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — SmartCart" }] }),
});

function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", search: { redirect: "/admin" } });
  }, [loading, user, navigate]);

  if (loading) return <div className="mx-auto max-w-md px-6 py-20 text-muted-foreground">Loading…</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">
          Your account doesn't have admin privileges. Use the backend to grant the <code className="rounded bg-muted px-1.5">admin</code> role to your user, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold">Admin</h1>
        <nav className="flex gap-1 rounded-full border border-border bg-card p-1">
          <Link to="/admin" activeOptions={{ exact: true }} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <BarChart3 className="mr-1.5 inline h-4 w-4" /> Dashboard
          </Link>
          <Link to="/admin/products" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <Package className="mr-1.5 inline h-4 w-4" /> Products
          </Link>
          <Link to="/admin/orders" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <ShoppingBag className="mr-1.5 inline h-4 w-4" /> Orders
          </Link>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
