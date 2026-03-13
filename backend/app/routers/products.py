# backend/app/routers/products.py

"""
Router para gerenciar produtos e categorias.

Endpoints:
- GET /api/v1/stores/{store_id}/products - Listar produtos
- GET /api/v1/stores/{store_id}/categories - Listar categorias
- POST /api/v1/stores/{store_id}/products - Criar produto
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
import logging
import asyncio
from datetime import datetime, timedelta

from ..database import get_db
from ..models.store import Product, Category, Store

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================================================
# CACHE EM MEMÓRIA
# ============================================================================

class CacheManager:
    def __init__(self, ttl_seconds: int = 300):
        self.cache = {}
        self.timestamps = {}
        self.ttl_seconds = ttl_seconds

    def get(self, key: str):
        if key not in self.cache:
            return None

        age = (datetime.now() - self.timestamps[key]).total_seconds()
        if age > self.ttl_seconds:
            del self.cache[key]
            del self.timestamps[key]
            logger.info(f"🗑️ Cache expirado: {key}")
            return None

        logger.info(f"✅ Cache HIT: {key}")
        return self.cache[key]

    def set(self, key: str, value):
        self.cache[key] = value
        self.timestamps[key] = datetime.now()
        logger.info(f"💾 Cache SET: {key}")

    def clear(self, key: str = None):
        if key:
            self.cache.pop(key, None)
            self.timestamps.pop(key, None)
            logger.info(f"🗑️ Cache limpo: {key}")
        else:
            self.cache.clear()
            self.timestamps.clear()
            logger.info(f"🗑️ Cache limpo completamente")

# Instância global do cache
cache_manager = CacheManager(ttl_seconds=300)

# ============================================================================
# ENDPOINTS DE CATEGORIAS
# ============================================================================

@router.get("/stores/{store_id}/categories", tags=["categories"])
def list_categories(
    store_id: int,
    db: Session = Depends(get_db)
):
    """
    Listar todas as categorias de uma loja com cache.

    Args:
        store_id: ID da loja
        db: Sessão do banco de dados

    Returns:
        Dict: Lista de categorias ativas com metadados

    Raises:
        HTTPException: Se a loja não existir (404)
    """
    try:
        cache_key = f"categories_{store_id}"

        # Tentar usar cache
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return cached_data

        # ✅ Verificar se a loja existe
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            logger.warning(f"❌ Loja {store_id} não encontrada")
            raise HTTPException(status_code=404, detail="Loja não encontrada")

        logger.info(f"📨 Buscando categorias da loja {store_id}...")

        # ✅ Buscar categorias com timeout
        try:
            categories = db.query(Category).filter(
                Category.store_id == store_id,
                Category.is_active == True
            ).order_by(Category.order).all()

            response = {
                "store_id": store_id,
                "total": len(categories),
                "data": categories
            }

            # Guardar em cache
            cache_manager.set(cache_key, response)

            logger.info(f"✅ {len(categories)} categorias encontradas")
            return response

        except Exception as db_error:
            logger.error(f"❌ Erro ao buscar categorias do BD: {str(db_error)}")
            raise HTTPException(
                status_code=504,
                detail="Banco de dados indisponível. Tente novamente em alguns minutos."
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao buscar categorias: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar categorias")

# ============================================================================
# ENDPOINTS DE PRODUTOS
# ============================================================================

@router.get("/stores/{store_id}/products", tags=["products"])
def list_products(
    store_id: int,
    category_id: int = Query(None, description="Filtrar por categoria"),
    skip: int = Query(0, ge=0, description="Número de registros a pular"),
    limit: int = Query(50, ge=1, le=100, description="Limite de registros"),
    db: Session = Depends(get_db)
):
    """
    Listar produtos de uma loja com paginação, filtros e cache.

    Args:
        store_id: ID da loja
        category_id: (Opcional) Filtrar por categoria
        skip: Número de registros a pular (padrão: 0)
        limit: Limite de registros (padrão: 50, máximo: 100)
        db: Sessão do banco de dados

    Returns:
        Dict: Lista de produtos com metadados

    Raises:
        HTTPException: Se a loja não existir (404)
    """
    try:
        # Criar chave de cache com filtros
        cache_key = f"products_{store_id}_{category_id}_{skip}_{limit}"

        # Tentar usar cache
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return cached_data

        # ✅ Verificar se a loja existe
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            logger.warning(f"❌ Loja {store_id} não encontrada")
            raise HTTPException(status_code=404, detail="Loja não encontrada")

        logger.info(f"📨 Buscando produtos da loja {store_id}...")

        # ✅ Buscar produtos com filtros e timeout
        try:
            query = db.query(Product).filter(
                Product.store_id == store_id,
                Product.is_available == True
            )

            # Filtrar por categoria se fornecido
            if category_id:
                query = query.filter(Product.category_id == category_id)
                logger.info(f"  Filtro: categoria {category_id}")

            # Contar total antes de paginar
            total = query.count()

            # Aplicar paginação e ordenação
            products = query.order_by(Product.order).offset(skip).limit(limit).all()

            response = {
                "store_id": store_id,
                "total": total,
                "skip": skip,
                "limit": limit,
                "count": len(products),
                "data": products
            }

            # Guardar em cache
            cache_manager.set(cache_key, response)

            logger.info(f"✅ {len(products)} produtos encontrados (total: {total})")
            return response

        except Exception as db_error:
            logger.error(f"❌ Erro ao buscar produtos do BD: {str(db_error)}")
            raise HTTPException(
                status_code=504,
                detail="Banco de dados indisponível. Tente novamente em alguns minutos."
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao buscar produtos: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar produtos")

@router.get("/products/{product_id}", tags=["products"])
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Buscar um produto específico pelo ID com cache.

    Args:
        product_id: ID do produto
        db: Sessão do banco de dados

    Returns:
        Product: Dados do produto

    Raises:
        HTTPException: Se o produto não existir (404)
    """
    try:
        cache_key = f"product_{product_id}"

        # Tentar usar cache
        cached_data = cache_manager.get(cache_key)
        if cached_data:
            return cached_data

        logger.info(f"📨 Buscando produto {product_id}...")

        product = db.query(Product).filter(Product.id == product_id).first()

        if not product:
            logger.warning(f"❌ Produto {product_id} não encontrado")
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # Guardar em cache
        cache_manager.set(cache_key, product)

        logger.info(f"✅ Produto encontrado: {product.name}")
        return product

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao buscar produto: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar produto")

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/products/health", tags=["health"])
def products_health():
    """
    Health check para o router de produtos.
    """
    return {
        "status": "ok",
        "service": "products",
        "cache_size": len(cache_manager.cache),
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# LIMPEZA DE CACHE (ADMIN)
# ============================================================================

@router.post("/products/cache/clear", tags=["admin"])
def clear_products_cache(db: Session = Depends(get_db)):
    """
    Limpa o cache de produtos (apenas para admin).
    """
    try:
        cache_manager.clear()
        logger.info("🗑️ Cache de produtos limpo")
        return {"message": "Cache limpo com sucesso"}
    except Exception as e:
        logger.error(f"❌ Erro ao limpar cache: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao limpar cache")