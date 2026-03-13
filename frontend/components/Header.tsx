// frontend/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { STORE_NAME, BRAND_COLORS } from '@/lib/constants';

const Header: React.FC = () => {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header
      className="sticky top-0 z-50 shadow-lg"
      style={{ backgroundColor: BRAND_COLORS.primary }}
    >
      <div className="container-custom py-4 flex items-center justify-between">
        {/* Logo/Nome da Loja */}
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: BRAND_COLORS.secondary }}
          >
            🍕
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{STORE_NAME}</h1>
            <p className="text-red-100 text-xs">Delivery Online</p>
          </div>
        </Link>

        {/* Carrinho */}
        <Link
          href="/checkout"
          className="relative flex items-center gap-2 bg-white text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span>🛒</span>
          <span>Carrinho</span>
          {itemCount > 0 && (
            <span
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: BRAND_COLORS.secondary }}
            >
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;