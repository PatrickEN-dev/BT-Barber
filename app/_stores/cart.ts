"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SerializedProduct } from "@/app/_lib/serializers";

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  barbershopId: string | null;
  items: CartItem[];
  pendingShop: { id: string; name: string } | null;
  pendingProduct: SerializedProduct | null;
  addItem: (product: SerializedProduct, shopName: string) => void;
  confirmSwitchShop: () => void;
  cancelSwitchShop: () => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
}

const itemFromProduct = (product: SerializedProduct): CartItem => ({
  productId: product.id,
  name: product.name,
  price: product.price,
  imageUrl: product.imageUrl,
  quantity: 1,
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      barbershopId: null,
      items: [],
      pendingShop: null,
      pendingProduct: null,

      addItem: (product, shopName) => {
        const { barbershopId, items } = get();

        if (barbershopId && barbershopId !== product.barbershopId && items.length > 0) {
          set({
            pendingProduct: product,
            pendingShop: { id: product.barbershopId, name: shopName },
          });
          return;
        }

        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
          return;
        }

        set({
          barbershopId: product.barbershopId,
          items: [...items, itemFromProduct(product)],
        });
      },

      confirmSwitchShop: () => {
        const { pendingProduct } = get();
        if (!pendingProduct) return;
        set({
          barbershopId: pendingProduct.barbershopId,
          items: [itemFromProduct(pendingProduct)],
          pendingProduct: null,
          pendingShop: null,
        });
      },

      cancelSwitchShop: () => set({ pendingProduct: null, pendingShop: null }),

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return {
            items,
            barbershopId: items.length === 0 ? null : state.barbershopId,
          };
        }),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.productId === productId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),

      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [], barbershopId: null }),
    }),
    {
      name: "btbarber-cart",
      partialize: (state) => ({ barbershopId: state.barbershopId, items: state.items }),
    }
  )
);

export const useCartTotals = () => {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0);
  return { count, total };
};
