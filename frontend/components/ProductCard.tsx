// frontend/components/ProductCard.tsx
'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { BRAND_COLORS, formatCurrency } from '@/lib/constants';

// ============================================================================
// INTERFACE - PROPS DO COMPONENTE
// ============================================================================

interface ProductCardProps {
  product: Product;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MAX_QUANTITY = 99;
const MIN_QUANTITY = 1;

// ============================================================================
// COMPONENTE: ProductCard
// ============================================================================

/**
 * Componente que exibe um produto individual com opções de quantidade e adição ao carrinho
 * @param product - Dados do produto a ser exibido
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // ========================================================================
  // ESTADO
  // ========================================================================
  const [quantity, setQuantity] = useState<number>(MIN_QUANTITY);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // ========================================================================
  // ZUSTAND STORE
  // ========================================================================
  const addItem = useCartStore((state) => state.addItem);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Aumentar quantidade
   */
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, MAX_QUANTITY));
  };

  /**
   * Diminuir quantidade
   */
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, MIN_QUANTITY));
  };

  /**
   * Adicionar produto ao carrinho
   */
  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      // Validar dados do produto
      if (!product.id || !product.name || product.price <= 0) {
        console.error('❌ Dados do produto inválidos:', product);
        alert('❌ Erro ao adicionar produto. Tente novamente.');
        return;
      }

      // Validar quantidade
      if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
        alert(`❌ Quantidade deve estar entre ${MIN_QUANTITY} e ${MAX_QUANTITY}`);
        return;
      }

      // ✅ CORRIGIDO: Não passar 'total' - será calculado automaticamente
      addItem({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        // 'total' é calculado automaticamente no store
      });

      // Feedback visual
      console.log(`✅ ${quantity}x ${product.name} adicionado ao carrinho!`);
      setShowFeedback(true);

      // Mostrar feedback por 2 segundos
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);

      // Reset quantity
      setQuantity(MIN_QUANTITY);
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      alert('❌ Erro ao adicionar produto. Tente novamente.');
    } finally {
      setIsAdding(false);
    }
  };

  // ========================================================================
  // CÁLCULOS
  // ========================================================================

  const totalPrice = product.price * quantity;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* ====================================================================
          IMAGEM / PLACEHOLDER
          ==================================================================== */}
      <div
        className="w-full h-48 flex items-center justify-center text-white text-6xl"
        style={{
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%)`,
        }}
      >
        🍕
      </div>

      {/* ====================================================================
          CONTEÚDO
          ==================================================================== */}
      <div className="p-4">
        {/* Nome do Produto */}
        <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>

        {/* Descrição do Produto */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Preço */}
        <div className="mb-4">
          <span
            className="text-2xl font-bold"
            style={{ color: BRAND_COLORS.primary }}
          >
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Seletor de Quantidade */}
        <div className="flex items-center gap-2 mb-4">
          {/* Botão Diminuir */}
          <button
            onClick={handleDecreaseQuantity}
            disabled={quantity <= MIN_QUANTITY || isAdding}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: BRAND_COLORS.primary,
              color: BRAND_COLORS.primary,
            }}
            aria-label="Diminuir quantidade"
          >
            −
          </button>

          {/* Quantidade */}
          <span className="w-8 text-center font-bold text-gray-800">
            {quantity}
          </span>

          {/* Botão Aumentar */}
          <button
            onClick={handleIncreaseQuantity}
            disabled={quantity >= MAX_QUANTITY || isAdding}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: BRAND_COLORS.primary,
              color: BRAND_COLORS.primary,
            }}
            aria-label="Aumentar quantidade"
          >
            +
          </button>

          {/* Total Parcial */}
          <span className="ml-auto text-sm font-semibold text-gray-700">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Botão Adicionar ao Carrinho */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: BRAND_COLORS.primary,
          }}
          onMouseEnter={(e) => {
            if (!isAdding) {
              e.currentTarget.style.backgroundColor = BRAND_COLORS.secondary;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND_COLORS.primary;
          }}
          aria-label={`Adicionar ${quantity}x ${product.name} ao carrinho`}
        >
          {isAdding ? '⏳ Adicionando...' : 'Adicionar ao Carrinho'}
        </button>

        {/* Feedback Visual */}
        {showFeedback && (
          <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center animate-pulse">
            ✅ Adicionado ao carrinho!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;