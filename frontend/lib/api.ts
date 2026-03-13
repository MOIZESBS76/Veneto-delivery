// frontend/lib/api.ts

// ============================================================================
// CONFIGURAÇÃO DA API
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = 60000; // 60 segundos para 4G
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

// ============================================================================
// INTERFACES - TIPOS DE DADOS
// ============================================================================

/**
 * Produto do cardápio
 */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number;
  store_id: number;
  is_available: boolean;
  image_url?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Categoria de produtos
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  store_id: number;
  icon?: string;
  order?: number;
  is_active?: boolean;
  products?: Product[];
  created_at?: string;
}

/**
 * Item do pedido
 */
export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

/**
 * Requisição para criar pedido
 */
export interface CreateOrderRequest {
  store_id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  delivery_fee: number;
  items: OrderItem[];
  notes?: string;
}

/**
 * Resposta de pedido
 */
export interface Order {
  id: number;
  order_code: string;
  store_id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

/**
 * Resposta genérica da API
 */
export interface ApiResponse<T> {
  data?: T;
  total?: number;
  count?: number;
  skip?: number;
  limit?: number;
  store_id?: number;
  message?: string;
  error?: string;
}

// ============================================================================
// CLASSE DE ERRO CUSTOMIZADA
// ============================================================================

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// CACHE EM MEMÓRIA
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const localStorageCache = typeof window !== 'undefined' ? window.localStorage : null;

function getCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params) return endpoint;
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${endpoint}?${paramStr}`;
}

function getFromMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_DURATION_MS) {
    memoryCache.delete(key);
    return null;
  }

  console.log(`✅ Cache HIT (memória): ${key}`);
  return entry.data;
}

function setMemoryCache<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`💾 Cache SET (memória): ${key}`);
}

function getFromLocalStorage<T>(key: string): T | null {
  if (!localStorageCache) return null;

  try {
    const item = localStorageCache.getItem(key);
    if (!item) return null;

    const entry = JSON.parse(item);
    const age = Date.now() - entry.timestamp;

    if (age > CACHE_DURATION_MS) {
      localStorageCache.removeItem(key);
      return null;
    }

    console.log(`✅ Cache HIT (localStorage): ${key}`);
    return entry.data;
  } catch (error) {
    console.error(`❌ Erro ao ler localStorage: ${error}`);
    return null;
  }
}

function setLocalStorage<T>(key: string, data: T): void {
  if (!localStorageCache) return;

  try {
    const entry = {
      data,
      timestamp: Date.now(),
    };
    localStorageCache.setItem(key, JSON.stringify(entry));
    console.log(`💾 Cache SET (localStorage): ${key}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar localStorage: ${error}`);
  }
}

function getFromCache<T>(key: string): T | null {
  // Tentar memória primeiro (mais rápido)
  const memoryData = getFromMemoryCache<T>(key);
  if (memoryData) return memoryData;

  // Depois tentar localStorage (fallback)
  return getFromLocalStorage<T>(key);
}

function setCache<T>(key: string, data: T): void {
  setMemoryCache(key, data);
  setLocalStorage(key, data);
}

// ============================================================================
// FUNÇÃO AUXILIAR: Fazer Requisição com Timeout e Retry
// ============================================================================

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = MAX_RETRIES,
  timeoutMs = API_TIMEOUT
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}: ${options.method || 'GET'} ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`⏱️ Timeout após ${timeoutMs}ms na tentativa ${attempt}`);
        controller.abort();
      }, timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`✅ Tentativa ${attempt} bem-sucedida (${response.status})`);
        return response;
      }

      // Se erro 5xx, tentar novamente
      if (response.status >= 500) {
        console.warn(`⚠️ Erro servidor ${response.status}, tentando novamente...`);
        throw new Error(`Server error: ${response.status}`);
      }

      // Se erro 4xx, não tentar novamente
      console.error(`❌ Erro cliente ${response.status}`);
      throw new Error(`Client error: ${response.status}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Tentativa ${attempt} falhou: ${errorMessage}`);

      if (attempt === maxRetries) {
        throw new Error(
          `Falha após ${maxRetries} tentativas. Backend pode estar indisponível. Tente novamente em alguns minutos.`
        );
      }

      // Backoff exponencial: 1s, 2s, 4s
      const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`⏳ Aguardando ${delayMs}ms antes de tentar novamente...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Unexpected error in fetchWithRetry');
}

// ============================================================================
// FUNÇÃO AUXILIAR: Extrair Dados da Resposta
// ============================================================================

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError(
      response.status,
      'Resposta da API não é JSON válido'
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || data.error || response.statusText,
      data
    );
  }

  return data;
}

// ============================================================================
// FUNÇÃO: Buscar Produtos por Loja
// ============================================================================

/**
 * Busca todos os produtos de uma loja específica com cache
 * @param storeId - ID da loja
 * @returns Array de produtos
 * @throws ApiError se a requisição falhar
 */
export async function getProductsByStore(storeId: number): Promise<Product[]> {
  try {
    const cacheKey = getCacheKey(`/stores/${storeId}/products`);

    // Tentar usar cache
    const cachedData = getFromCache<Product[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const url = `${API_BASE_URL}/stores/${storeId}/products`;
    console.log(`📨 Buscando produtos da loja ${storeId}...`);

    const response = await fetchWithRetry(url);
    const data = await parseResponse<ApiResponse<Product[]>>(response);

    // Extrair array de produtos da resposta
    const products = data.data || (Array.isArray(data) ? data : []);

    // Guardar em cache
    setCache(cacheKey, products);

    console.log(`✅ ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : error instanceof Error
      ? error.message
      : 'Erro ao buscar produtos';

    console.error(`❌ ${message}`, error);
    throw new Error(message);
  }
}

// ============================================================================
// FUNÇÃO: Buscar Categorias por Loja
// ============================================================================

/**
 * Busca todas as categorias de uma loja específica com cache
 * @param storeId - ID da loja
 * @returns Array de categorias
 * @throws ApiError se a requisição falhar
 */
export async function getCategoriesByStore(storeId: number): Promise<Category[]> {
  try {
    const cacheKey = getCacheKey(`/stores/${storeId}/categories`);

    // Tentar usar cache
    const cachedData = getFromCache<Category[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const url = `${API_BASE_URL}/stores/${storeId}/categories`;
    console.log(`📨 Buscando categorias da loja ${storeId}...`);

    const response = await fetchWithRetry(url);
    const data = await parseResponse<ApiResponse<Category[]>>(response);

    // Extrair array de categorias da resposta
    const categories = data.data || (Array.isArray(data) ? data : []);

    // Guardar em cache
    setCache(cacheKey, categories);

    console.log(`✅ ${categories.length} categorias encontradas`);
    return categories;
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : error instanceof Error
      ? error.message
      : 'Erro ao buscar categorias';

    console.error(`❌ ${message}`, error);
    throw new Error(message);
  }
}

// ============================================================================
// FUNÇÃO: Criar Pedido
// ============================================================================

/**
 * Cria um novo pedido
 * @param order - Dados do pedido
 * @returns Pedido criado com ID e código
 * @throws ApiError se a requisição falhar
 */
export async function createOrder(order: CreateOrderRequest): Promise<Order> {
  try {
    const url = `${API_BASE_URL}/orders`;
    console.log(`📨 Criando novo pedido...`);

    // Validar dados do pedido
    if (!order.customer_name || !order.customer_phone || !order.customer_address) {
      throw new Error('Dados do cliente incompletos');
    }

    if (!order.items || order.items.length === 0) {
      throw new Error('Pedido sem itens');
    }

    const response = await fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(order),
    });

    const data = await parseResponse<Order>(response);

    // Limpar cache de produtos após criar pedido
    memoryCache.clear();
    if (localStorageCache) {
      Object.keys(localStorageCache).forEach((key) => {
        if (key.includes('products') || key.includes('categories')) {
          localStorageCache.removeItem(key);
        }
      });
    }

    console.log(`✅ Pedido criado com sucesso: ${data.order_code}`);
    return data;
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : error instanceof Error
      ? error.message
      : 'Erro ao criar pedido';

    console.error(`❌ ${message}`, error);
    throw new Error(message);
  }
}

// ============================================================================
// FUNÇÃO: Buscar Pedido por Código
// ============================================================================

/**
 * Busca um pedido específico pelo código
 * @param orderCode - Código do pedido
 * @returns Dados do pedido
 * @throws ApiError se a requisição falhar
 */
export async function getOrderByCode(orderCode: string): Promise<Order> {
  try {
    const url = `${API_BASE_URL}/orders/${orderCode}`;
    console.log(`📨 Buscando pedido ${orderCode}...`);

    const response = await fetchWithRetry(url);
    const data = await parseResponse<Order>(response);

    console.log(`✅ Pedido encontrado: ${data.order_code}`);
    return data;
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : 'Erro ao buscar pedido';

    console.error(`❌ ${message}`, error);
    throw new Error(message);
  }
}

// ============================================================================
// FUNÇÃO: Buscar Loja por ID
// ============================================================================

/**
 * Busca informações de uma loja específica com cache
 * @param storeId - ID da loja
 * @returns Dados da loja
 * @throws ApiError se a requisição falhar
 */
export async function getStoreById(storeId: number): Promise<any> {
  try {
    const cacheKey = getCacheKey(`/stores/${storeId}`);

    // Tentar usar cache
    const cachedData = getFromCache<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const url = `${API_BASE_URL}/stores/${storeId}`;
    console.log(`📨 Buscando loja ${storeId}...`);

    const response = await fetchWithRetry(url);
    const data = await parseResponse<any>(response);

    // Guardar em cache
    setCache(cacheKey, data);

    console.log(`✅ Loja encontrada: ${data.name}`);
    return data;
  } catch (error) {
    const message = error instanceof ApiError
      ? error.message
      : 'Erro ao buscar loja';

    console.error(`❌ ${message}`, error);
    throw new Error(message);
  }
}

// ============================================================================
// FUNÇÃO: Health Check
// ============================================================================

/**
 * Verifica se a API está disponível
 * @returns true se a API está respondendo
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL.replace('/api/v1', '')}/health`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    const isHealthy = response.ok;
    console.log(`${isHealthy ? '✅' : '❌'} API ${isHealthy ? 'está saudável' : 'está indisponível'}`);
    return isHealthy;
  } catch (error) {
    console.warn(`⚠️ API não está disponível: ${error}`);
    return false;
  }
}

// ============================================================================
// FUNÇÃO: Limpar Cache
// ============================================================================

/**
 * Limpa todo o cache (memória e localStorage)
 */
export function clearCache(): void {
  memoryCache.clear();
  if (localStorageCache) {
    Object.keys(localStorageCache).forEach((key) => {
      if (key.includes('veneto')) {
        localStorageCache.removeItem(key);
      }
    });
  }
  console.log(`🗑️ Cache limpo`);
}