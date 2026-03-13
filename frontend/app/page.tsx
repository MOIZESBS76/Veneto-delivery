// frontend/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProductsByStore, getCategoriesByStore, Product, Category } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { STORE_ID, CASHBACK_DESCRIPTION, BRAND_COLORS } from '@/lib/constants';
import Link from 'next/link';

// ============================================================================
// FUNÇÕES DE CACHE E RETRY
// ============================================================================

interface CacheData {
  products: Product[];
  categories: Category[];
  timestamp: number;
}

const CACHE_KEY = 'veneto_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

function getCachedData(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CacheData;
    const age = Date.now() - data.timestamp;

    if (age < CACHE_DURATION_MS) {
      console.log('✅ Usando cache válido');
      return data;
    }

    console.log('⏰ Cache expirado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao ler cache:', error);
    return null;
  }
}

function setCachedData(products: Product[], categories: Category[]): void {
  try {
    const data: CacheData = {
      products,
      categories,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    console.log('💾 Cache salvo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar cache:', error);
  }
}

async function fetchWithRetry(
  fetchFn: () => Promise<any>,
  maxRetries = 3,
  timeoutMs = 60000
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`);

      // Criar controller com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Executar fetch
      const result = await Promise.race([
        fetchFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        ),
      ]);

      clearTimeout(timeoutId);
      console.log(`✅ Tentativa ${attempt} bem-sucedida`);
      return result;
    } catch (error) {
      console.error(`❌ Tentativa ${attempt} falhou:`, error);

      if (attempt === maxRetries) {
        throw new Error(
          `Falha após ${maxRetries} tentativas. Verifique sua conexão.`
        );
      }

      // Backoff exponencial: 1s, 2s, 4s
      const delayMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`⏳ Aguardando ${delayMs}ms antes de tentar novamente...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tentar usar cache primeiro
        const cached = getCachedData();
        if (cached) {
          setProducts(cached.products);
          setCategories(cached.categories);
          if (cached.categories.length > 0) {
            setSelectedCategory(cached.categories[0].id);
          }
          setIsOffline(true);
          setLoading(false);
          return;
        }

        // Se não tem cache, buscar do servidor com retry
        const [productsData, categoriesData] = await Promise.all([
          fetchWithRetry(() => getProductsByStore(STORE_ID)),
          fetchWithRetry(() => getCategoriesByStore(STORE_ID)),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
        setCachedData(productsData, categoriesData);

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }

        setIsOffline(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar produtos';
        setError(errorMessage);
        console.error('❌ Erro ao carregar dados:', err);

        // Tentar usar cache antigo como fallback
        const cachedFallback = localStorage.getItem(CACHE_KEY);
        if (cachedFallback) {
          try {
            const data = JSON.parse(cachedFallback) as CacheData;
            setProducts(data.products);
            setCategories(data.categories);
            if (data.categories.length > 0) {
              setSelectedCategory(data.categories[0].id);
            }
            setIsOffline(true);
            setError(null);
          } catch (fallbackError) {
            console.error('❌ Erro ao usar cache antigo:', fallbackError);
          }
        }
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

        {/* Indicador de modo offline */}
        {isOffline && (
          <div className="bg-yellow-500 text-white px-4 py-2 rounded mb-4 inline-block">
            ⚠️ Modo offline - usando dados em cache
          </div>
        )}

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
          <p className="font-bold">❌ Erro ao carregar</p>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Dica: Verifique sua conexão de internet e tente novamente.
          </p>
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
          <p className="text-gray-600 text-lg">
            📭 Nenhum produto disponível nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
}