# backend/app/services/product_service.py
"""
Serviço de produtos e categorias.

Responsável por lógica de negócio relacionada a produtos e categorias.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..models.store import Product, Category, Store
from ..schemas.product import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================================
# SERVIÇOS DE CATEGORIA
# ============================================================================

def create_category(db: Session, category: CategoryCreate) -> Category:
    """
    Criar uma nova categoria.
    
    Args:
        db: Sessão do banco de dados
        category: Dados da categoria (CategoryCreate)
    
    Returns:
        Category: Categoria criada
    
    Raises:
        ValueError: Se a loja não existir
        IntegrityError: Se houver erro de integridade
    """
    try:
        # ✅ Validar se a loja existe
        store = db.query(Store).filter(Store.id == category.store_id).first()
        if not store:
            logger.warning(f"⚠️ Loja {category.store_id} não encontrada")
            raise ValueError(f"Loja {category.store_id} não encontrada")
        
        logger.info(f"📝 Criando categoria: {category.name} (loja {category.store_id})")
        
        # ✅ Criar categoria
        db_category = Category(
            store_id=category.store_id,
            name=category.name,
            description=category.description,
            icon=category.icon,
            order=category.order,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        logger.info(f"✅ Categoria criada: ID {db_category.id}")
        return db_category
    
    except ValueError as ve:
        logger.error(f"❌ Erro de validação: {str(ve)}")
        db.rollback()
        raise
    
    except IntegrityError as ie:
        logger.error(f"❌ Erro de integridade: {str(ie)}")
        db.rollback()
        raise ValueError("Erro ao criar categoria (dados duplicados ou inválidos)")
    
    except Exception as e:
        logger.error(f"❌ Erro ao criar categoria: {str(e)}")
        db.rollback()
        raise

def get_categories_by_store(db: Session, store_id: int, active_only: bool = True) -> list:
    """
    Buscar categorias de uma loja.
    
    Args:
        db: Sessão do banco de dados
        store_id: ID da loja
        active_only: Retornar apenas categorias ativas (padrão: True)
    
    Returns:
        List[Category]: Lista de categorias
    """
    try:
        logger.info(f"🔍 Buscando categorias da loja {store_id}")
        
        query = db.query(Category).filter(Category.store_id == store_id)
        
        if active_only:
            query = query.filter(Category.is_active == True)
        
        categories = query.order_by(Category.order).all()
        
        logger.info(f"✅ {len(categories)} categorias encontradas")
        return categories
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar categorias: {str(e)}")
        raise

def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Category:
    """
    Atualizar uma categoria.
    
    Args:
        db: Sessão do banco de dados
        category_id: ID da categoria
        category_update: Dados para atualizar
    
    Returns:
        Category: Categoria atualizada
    
    Raises:
        ValueError: Se a categoria não existir
    """
    try:
        logger.info(f"📝 Atualizando categoria {category_id}")
        
        category = db.query(Category).filter(Category.id == category_id).first()
        
        if not category:
            logger.warning(f"⚠️ Categoria {category_id} não encontrada")
            raise ValueError(f"Categoria {category_id} não encontrada")
        
        # ✅ Atualizar apenas campos fornecidos
        update_data = category_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        db.commit()
        db.refresh(category)
        
        logger.info(f"✅ Categoria {category_id} atualizada")
        return category
    
    except ValueError as ve:
        logger.error(f"❌ Erro de validação: {str(ve)}")
        db.rollback()
        raise
    
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar categoria: {str(e)}")
        db.rollback()
        raise

# ============================================================================
# SERVIÇOS DE PRODUTO
# ============================================================================

def create_product(db: Session, product: ProductCreate) -> Product:
    """
    Criar um novo produto.
    
    Args:
        db: Sessão do banco de dados
        product: Dados do produto (ProductCreate)
    
    Returns:
        Product: Produto criado
    
    Raises:
        ValueError: Se a loja ou categoria não existir
        IntegrityError: Se houver erro de integridade
    """
    try:
        # ✅ Validar se a loja existe
        store = db.query(Store).filter(Store.id == product.store_id).first()
        if not store:
            logger.warning(f"⚠️ Loja {product.store_id} não encontrada")
            raise ValueError(f"Loja {product.store_id} não encontrada")
        
        # ✅ Validar se a categoria existe
        category = db.query(Category).filter(
            Category.id == product.category_id,
            Category.store_id == product.store_id
        ).first()
        if not category:
            logger.warning(f"⚠️ Categoria {product.category_id} não encontrada na loja {product.store_id}")
            raise ValueError(f"Categoria não encontrada nesta loja")
        
        logger.info(f"📝 Criando produto: {product.name} (loja {product.store_id})")
        
        # ✅ Criar produto
        db_product = Product(
            store_id=product.store_id,
            category_id=product.category_id,
            name=product.name,
            description=product.description,
            price=product.price,
            image_url=product.image_url,
            order=product.order,
            is_available=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        logger.info(f"✅ Produto criado: ID {db_product.id}")
        return db_product
    
    except ValueError as ve:
        logger.error(f"❌ Erro de validação: {str(ve)}")
        db.rollback()
        raise
    
    except IntegrityError as ie:
        logger.error(f"❌ Erro de integridade: {str(ie)}")
        db.rollback()
        raise ValueError("Erro ao criar produto (dados duplicados ou inválidos)")
    
    except Exception as e:
        logger.error(f"❌ Erro ao criar produto: {str(e)}")
        db.rollback()
        raise

def get_products_by_store(db: Session, store_id: int, category_id: int = None, available_only: bool = True) -> list:
    """
    Buscar produtos de uma loja.
    
    Args:
        db: Sessão do banco de dados
        store_id: ID da loja
        category_id: (Opcional) Filtrar por categoria
        available_only: Retornar apenas produtos disponíveis (padrão: True)
    
    Returns:
        List[Product]: Lista de produtos
    """
    try:
        logger.info(f"🔍 Buscando produtos da loja {store_id}")
        
        query = db.query(Product).filter(Product.store_id == store_id)
        
        if available_only:
            query = query.filter(Product.is_available == True)
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
            logger.info(f"  Filtro: categoria {category_id}")
        
        products = query.order_by(Product.order).all()
        
        logger.info(f"✅ {len(products)} produtos encontrados")
        return products
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar produtos: {str(e)}")
        raise

def get_product_by_id(db: Session, product_id: int) -> Product:
    """
    Buscar um produto pelo ID.
    
    Args:
        db: Sessão do banco de dados
        product_id: ID do produto
    
    Returns:
        Product: Produto encontrado ou None
    """
    try:
        logger.info(f"🔍 Buscando produto {product_id}")
        
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if product:
            logger.info(f"✅ Produto encontrado: {product.name}")
        else:
            logger.warning(f"⚠️ Produto {product_id} não encontrado")
        
        return product
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar produto: {str(e)}")
        raise

def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Product:
    """
    Atualizar um produto.
    
    Args:
        db: Sessão do banco de dados
        product_id: ID do produto
        product_update: Dados para atualizar
    
    Returns:
        Product: Produto atualizado
    
    Raises:
        ValueError: Se o produto não existir
    """
    try:
        logger.info(f"📝 Atualizando produto {product_id}")
        
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            logger.warning(f"⚠️ Produto {product_id} não encontrado")
            raise ValueError(f"Produto {product_id} não encontrado")
        
        # ✅ Atualizar apenas campos fornecidos
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(product)
        
        logger.info(f"✅ Produto {product_id} atualizado")
        return product
    
    except ValueError as ve:
        logger.error(f"❌ Erro de validação: {str(ve)}")
        db.rollback()
        raise
    
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar produto: {str(e)}")
        db.rollback()
        raise