# backend/app/schemas/product.py
"""
Schemas (Pydantic models) para validação de dados de produtos e categorias.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ============================================================================
# CATEGORY SCHEMAS
# ============================================================================

class CategoryBase(BaseModel):
    """Schema base para categoria."""
    name: str = Field(..., min_length=1, max_length=255, description="Nome da categoria")
    description: Optional[str] = Field(None, max_length=500, description="Descrição da categoria")
    icon: Optional[str] = Field(None, max_length=50, description="Ícone da categoria")
    order: int = Field(default=0, ge=0, description="Ordem de exibição")

class CategoryCreate(CategoryBase):
    """Schema para criar categoria."""
    store_id: int = Field(..., gt=0, description="ID da loja")

class CategoryUpdate(BaseModel):
    """Schema para atualizar categoria."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=50)
    order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    """Schema de resposta para categoria."""
    id: int
    store_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# PRODUCT SCHEMAS
# ============================================================================

class ProductBase(BaseModel):
    """Schema base para produto."""
    name: str = Field(..., min_length=1, max_length=255, description="Nome do produto")
    description: Optional[str] = Field(None, max_length=500, description="Descrição do produto")
    price: float = Field(..., gt=0, description="Preço do produto")
    image_url: Optional[str] = Field(None, max_length=500, description="URL da imagem")
    order: int = Field(default=0, ge=0, description="Ordem de exibição")

class ProductCreate(ProductBase):
    """Schema para criar produto."""
    store_id: int = Field(..., gt=0, description="ID da loja")
    category_id: int = Field(..., gt=0, description="ID da categoria")

class ProductUpdate(BaseModel):
    """Schema para atualizar produto."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None

class ProductResponse(ProductBase):
    """Schema de resposta para produto."""
    id: int
    store_id: int
    category_id: int
    is_available: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductWithCategory(ProductResponse):
    """Schema de resposta para produto com categoria."""
    category: CategoryResponse