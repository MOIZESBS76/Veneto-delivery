// frontend/lib/store.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// CONSTANTES
// ============================================================================
const MAX_QUANTITY_PER_ITEM = 99;
const MIN_QUANTITY = 1;
const STORAGE_KEY = 'pizza-delivery-cart';

// ============================================================================
// INTERFACES - TIPOS DE DADOS
// ============================================================================

/**
 * Item do carrinho
 */
export interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/**
 * Estado do carrinho
 */
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'total'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItems: () => CartItem[];
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: (deliveryFee: number) => number;
  getCashback: (cashbackPercentage: number) => number;
  validateCart: () => boolean;
}

// ============================================================================
// FUNÇÃO AUXILIAR: Calcular Total do Item
// ============================================================================

function calculateItemTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

// ============================================================================
// FUNÇÃO AUXILIAR: Validar Quantidade
// ============================================================================

function validateQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) &&
    quantity >= MIN_QUANTITY &&
    quantity <= MAX_QUANTITY_PER_ITEM
  );
}

// ============================================================================
// ZUSTAND STORE - CARRINHO DE COMPRAS
// ============================================================================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // ========================================================================
      // AÇÃO: Adicionar Item ao Carrinho
      // ========================================================================
      addItem: (item: Omit<CartItem, 'total'>) => {
        // Validar dados de entrada
        if (!item.product_id || !item.product_name || item.quantity < MIN_QUANTITY) {
          console.error('❌ Dados inválidos ao adicionar item:', item);
          return;
        }

        if (!validateQuantity(item.quantity)) {
          console.warn(
            `⚠️ Quantidade inválida: ${item.quantity}. Máximo: ${MAX_QUANTITY_PER_ITEM}`
          );
          return;
        }

        set((state) => {
          const existingItem = state.items.find(
            (i) => i.product_id === item.product_id
          );

          if (existingItem) {
            // Se o produto já existe, aumenta a quantidade
            const newQuantity = existingItem.quantity + item.quantity;

            if (!validateQuantity(newQuantity)) {
              console.warn(
                `⚠️ Quantidade total (${newQuantity}) excede o máximo (${MAX_QUANTITY_PER_ITEM})`
              );
              return state;
            }

            console.log(
              `📦 Atualizando quantidade de "${item.product_name}": ${existingItem.quantity} → ${newQuantity}`
            );

            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? {
                      ...i,
                      quantity: newQuantity,
                      total: calculateItemTotal(newQuantity, i.unit_price),
                    }
                  : i
              ),
            };
          }

          // Se não existe, adiciona novo item
          console.log(`✅ Adicionando "${item.product_name}" ao carrinho`);

          return {
            items: [
              ...state.items,
              {
                ...item,
                total: calculateItemTotal(item.quantity, item.unit_price),
              },
            ],
          };
        });
      },

      // ========================================================================
      // AÇÃO: Remover Item do Carrinho
      // ========================================================================
      removeItem: (productId: number) => {
        set((state) => {
          const item = state.items.find((i) => i.product_id === productId);
          if (item) {
            console.log(`🗑️ Removendo "${item.product_name}" do carrinho`);
          }

          return {
            items: state.items.filter((i) => i.product_id !== productId),
          };
        });
      },

      // ========================================================================
      // AÇÃO: Atualizar Quantidade do Item
      // ========================================================================
      updateQuantity: (productId: number, quantity: number) => {
        // Validar quantidade
        if (!validateQuantity(quantity)) {
          console.warn(
            `⚠️ Quantidade inválida: ${quantity}. Deve estar entre ${MIN_QUANTITY} e ${MAX_QUANTITY_PER_ITEM}`
          );
          return;
        }

        set((state) => {
          const item = state.items.find((i) => i.product_id === productId);

          if (!item) {
            console.warn(`⚠️ Produto ${productId} não encontrado no carrinho`);
            return state;
          }

          console.log(
            `📝 Atualizando quantidade de "${item.product_name}": ${item.quantity} → ${quantity}`
          );

          return {
            items: state.items.map((i) =>
              i.product_id === productId
                ? {
                    ...i,
                    quantity,
                    total: calculateItemTotal(quantity, i.unit_price),
                  }
                : i
            ),
          };
        });
      },

      // ========================================================================
      // AÇÃO: Limpar Carrinho
      // ========================================================================
      clearCart: () => {
        console.log('🧹 Limpando carrinho');
        set({ items: [] });
      },

      // ========================================================================
      // GETTER: Obter Itens do Carrinho
      // ========================================================================
      getItems: () => {
        return get().items;
      },

      // ========================================================================
      // GETTER: Contar Itens do Carrinho
      // ========================================================================
      getItemCount: () => {
        const count = get().items.reduce((total, item) => total + item.quantity, 0);
        return count;
      },

      // ========================================================================
      // GETTER: Calcular Subtotal
      // ========================================================================
      getSubtotal: () => {
        const subtotal = get().items.reduce((total, item) => total + item.total, 0);
        return Math.round(subtotal * 100) / 100;
      },

      // ========================================================================
      // GETTER: Calcular Total com Taxa de Entrega
      // ========================================================================
      getTotal: (deliveryFee: number) => {
        const subtotal = get().getSubtotal();
        const total = subtotal + deliveryFee;
        return Math.round(total * 100) / 100;
      },

      // ========================================================================
      // GETTER: Calcular Cashback
      // ========================================================================
      getCashback: (cashbackPercentage: number) => {
        const subtotal = get().getSubtotal();
        const cashback = subtotal * (cashbackPercentage / 100);
        return Math.round(cashback * 100) / 100;
      },

      // ========================================================================
      // GETTER: Validar Carrinho
      // ========================================================================
      validateCart: () => {
        const items = get().items;

        if (items.length === 0) {
          console.warn('⚠️ Carrinho vazio');
          return false;
        }

        // Validar cada item
        for (const item of items) {
          if (!item.product_id || !item.product_name) {
            console.error('❌ Item com dados inválidos:', item);
            return false;
          }

          if (!validateQuantity(item.quantity)) {
            console.error('❌ Quantidade inválida:', item.quantity);
            return false;
          }

          if (item.unit_price <= 0) {
            console.error('❌ Preço inválido:', item.unit_price);
            return false;
          }

          // Validar se o total está correto
          const expectedTotal = calculateItemTotal(item.quantity, item.unit_price);
          if (Math.abs(item.total - expectedTotal) > 0.01) {
            console.warn(
              `⚠️ Total inconsistente para "${item.product_name}": ${item.total} vs ${expectedTotal}`
            );
          }
        }

        console.log(`✅ Carrinho validado: ${items.length} itens`);
        return true;
      },
    }),
    {
      name: STORAGE_KEY,
      // Persistir apenas os items, não as funções
      partialize: (state) => ({
        items: state.items,
      }),
      // Sincronizar entre abas
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migração de versão anterior se necessário
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

// ============================================================================
// HOOK CUSTOMIZADO: Usar Carrinho com Logging
// ============================================================================

export function useCart() {
  const store = useCartStore();

  return {
    items: store.getItems(),
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    getTotal: store.getTotal,
    getCashback: store.getCashback,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    validateCart: store.validateCart,
  };
}