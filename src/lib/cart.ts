import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

const KEY = "smartcart_cart_v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("smartcart:cart"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener("smartcart:cart", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("smartcart:cart", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    const current = read();
    const existing = current.find((c) => c.id === item.id);
    let next: CartItem[];
    if (existing) {
      next = current.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      next = [...current, { ...item, quantity: qty }];
    }
    write(next);
  }, []);

  const update = useCallback((id: string, qty: number) => {
    const next = read()
      .map((c) => (c.id === id ? { ...c, quantity: qty } : c))
      .filter((c) => c.quantity > 0);
    write(next);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return { items, add, update, remove, clear, count, subtotal };
}
