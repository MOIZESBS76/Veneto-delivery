// frontend/lib/api.ts

// ============================================================================
// CONFIGURAÇÃO DA API
// ============================================================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_TIMEOUT = 10000; // 10 segundos

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
// FUNÇÃO AUXILIAR: Fazer Requisição com Timeout
// ============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Requisição expirou. Tente novamente.');
    }
    throw error;
  }
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
 * Busca todos os produtos de uma loja específica
 * @param storeId - ID da loja
 * @returns Array de produtos
 * @throws ApiError se a requisição falhar
 */
export async function getProductsByStore(storeId: number): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}/stores/${storeId}/products`;
    console.log(`📨 Buscando produtos da loja ${storeId}...`);

    const response = await fetchWithTimeout(url);
    const data = await parseResponse<ApiResponse<Product[]>>(response);

    // Extrair array de produtos da resposta
    const products = data.data || (Array.isArray(data) ? data : []);

    console.log(`✅ ${products.length} produtos encontrados`);
    return products;
  } catch (error) {
    const message = error instanceof ApiError 
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
 * Busca todas as categorias de uma loja específica
 * @param storeId - ID da loja
 * @returns Array de categorias
 * @throws ApiError se a requisição falhar
 */
export async function getCategoriesByStore(storeId: number): Promise<Category[]> {
  try {
    const url = `${API_BASE_URL}/stores/${storeId}/categories`;
    console.log(`📨 Buscando categorias da loja ${storeId}...`);

    const response = await fetchWithTimeout(url);
    const data = await parseResponse<ApiResponse<Category[]>>(response);

    // Extrair array de categorias da resposta
    const categories = data.data || (Array.isArray(data) ? data : []);

    console.log(`✅ ${categories.length} categorias encontradas`);
    return categories;
  } catch (error) {
    const message = error instanceof ApiError 
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

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    const data = await parseResponse<Order>(response);

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

    const response = await fetchWithTimeout(url);
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
 * Busca informações de uma loja específica
 * @param storeId - ID da loja
 * @returns Dados da loja
 * @throws ApiError se a requisição falhar
 */
export async function getStoreById(storeId: number): Promise<any> {
  try {
    const url = `${API_BASE_URL}/stores/${storeId}`;
    console.log(`📨 Buscando loja ${storeId}...`);

    const response = await fetchWithTimeout(url);
    const data = await parseResponse<any>(response);

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
    const response = await fetchWithTimeout(url, {}, 5000);
    return response.ok;
  } catch (error) {
    console.warn('⚠️ API não está disponível');
    return false;
  }
}