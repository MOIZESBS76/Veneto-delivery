// frontend/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProductsByStore, getCategoriesByStore, Product, Category } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { STORE_ID, CASHBACK_DESCRIPTION, BRAND_COLORS } from '@/lib/constants';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProductsByStore(STORE_ID),
          getCategoriesByStore(STORE_ID),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="container-custom py-8">
      {/* Banner */}
      <div
        className="text-white rounded-lg p-8 mb-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%)`,
        }}
      >
        <h1 className="text-4xl font-bold mb-2">🍕 Pizzaria Veneto</h1>
        <p className="text-lg mb-4">{CASHBACK_DESCRIPTION}</p>
        {itemCount > 0 && (
          <Link
            href="/checkout"
            className="inline-block bg-white text-red-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Ver Carrinho ({itemCount} itens)
          </Link>
        )}
      </div>

      {/* Filtro de Categorias */}
      {categories.length > 0 && (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category.id ? BRAND_COLORS.primary : 'white',
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Carregamento */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">⏳ Carregando cardápio...</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      {/* Grid de Produtos */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">📭 Nenhum produto disponível nesta categoria.</p>
        </div>
      )}
    </div>
  );
}