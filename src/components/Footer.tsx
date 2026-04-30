export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-display text-sm font-semibold tracking-tight">SmartCart</p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SmartCart. Crafted for the modern shopper.
          </p>
        </div>
      </div>
    </footer>
  );
}
