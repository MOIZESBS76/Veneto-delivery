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
from ..database import get_db
from ..models.store import Product, Category, Store
from ..services.product_service import (
    get_products_by_store,
    get_categories_by_store,
    get_product_by_id
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# ============================================================================
# ENDPOINTS DE CATEGORIAS
# ============================================================================

@router.get("/stores/{store_id}/categories", tags=["categories"])
def list_categories(
    store_id: int,
    db: Session = Depends(get_db)
):
    """
    Listar todas as categorias de uma loja.
    
    Args:
        store_id: ID da loja
        db: Sessão do banco de dados
    
    Returns:
        List[Category]: Lista de categorias ativas
    
    Raises:
        HTTPException: Se a loja não existir (404)
    """
    try:
        # ✅ Verificar se a loja existe
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            logger.warning(f"⚠️ Loja {store_id} não encontrada")
            raise HTTPException(status_code=404, detail="Loja não encontrada")
        
        logger.info(f"📨 Buscando categorias da loja {store_id}")
        
        # ✅ Buscar categorias
        categories = get_categories_by_store(db, store_id)
        
        logger.info(f"📤 {len(categories)} categorias encontradas")
        
        return {
            "store_id": store_id,
            "total": len(categories),
            "data": categories
        }
    
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
    Listar produtos de uma loja com paginação e filtros.
    
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
        # ✅ Verificar se a loja existe
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            logger.warning(f"⚠️ Loja {store_id} não encontrada")
            raise HTTPException(status_code=404, detail="Loja não encontrada")
        
        logger.info(f"📨 Buscando produtos da loja {store_id}")
        
        # ✅ Buscar produtos com filtros
        query = db.query(Product).filter(
            Product.store_id == store_id,
            Product.is_available == True
        )
        
        # ✅ Filtrar por categoria se fornecido
        if category_id:
            query = query.filter(Product.category_id == category_id)
            logger.info(f"  Filtro: categoria {category_id}")
        
        # ✅ Contar total antes de paginar
        total = query.count()
        
        # ✅ Aplicar paginação
        products = query.order_by(Product.order).offset(skip).limit(limit).all()
        
        logger.info(f"📤 {len(products)} produtos encontrados (total: {total})")
        
        return {
            "store_id": store_id,
            "total": total,
            "skip": skip,
            "limit": limit,
            "count": len(products),
            "data": products
        }
    
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
    Buscar um produto específico pelo ID.
    
    Args:
        product_id: ID do produto
        db: Sessão do banco de dados
    
    Returns:
        Product: Dados do produto
    
    Raises:
        HTTPException: Se o produto não existir (404)
    """
    try:
        logger.info(f"📨 Buscando produto {product_id}")
        
        product = get_product_by_id(db, product_id)
        
        if not product:
            logger.warning(f"⚠️ Produto {product_id} não encontrado")
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        logger.info(f"📤 Produto encontrado: {product.name}")
        
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
    return {"status": "ok", "service": "products"}