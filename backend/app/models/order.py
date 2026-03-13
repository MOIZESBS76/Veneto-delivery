# backend/app/models/order.py
"""
Modelos de Pedidos e Itens de Pedidos.

Este módulo define as estruturas de dados para pedidos e seus itens,
incluindo relacionamentos, validações e auditoria.
"""

from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text,
    Boolean, Numeric, CheckConstraint, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Order(Base):
    """
    Modelo de Pedido.
    
    Representa um pedido realizado por um cliente em uma loja.
    Inclui informações de entrega, pagamento e status.
    
    Attributes:
        id: Identificador único do pedido
        order_code: Código único do pedido (ex: ORD-ABC12345)
        store_id: ID da loja que recebeu o pedido
        customer_name: Nome do cliente
        customer_phone: Telefone do cliente
        customer_address: Endereço de entrega
        payment_method: Método de pagamento (dinheiro, cartão, pix, etc)
        subtotal: Valor total dos itens (sem taxa de entrega)
        delivery_fee: Taxa de entrega
        total: Valor total do pedido (subtotal + taxa)
        cashback_amount: Valor de cashback oferecido (5% do subtotal)
        status: Status do pedido (pendente, confirmado, em_entrega, entregue, cancelado)
        notes: Observações/instruções especiais do cliente
        is_deleted: Soft delete flag
        created_at: Data/hora de criação do pedido
        updated_at: Data/hora da última atualização
        delivered_at: Data/hora da entrega
        items: Relacionamento com itens do pedido
    """
    
    __tablename__ = "orders"
    
    # Campos principais
    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(50), unique=True, nullable=False, index=True)
    store_id = Column(Integer, nullable=False, index=True)
    
    # Informações do cliente
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_address = Column(String(500), nullable=False)
    
    # Informações financeiras
    payment_method = Column(String(50), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), nullable=False, default=0.0)
    total = Column(Numeric(10, 2), nullable=False)
    cashback_amount = Column(Numeric(10, 2), nullable=False, default=0.0)
    
    # Status e observações
    status = Column(
        String(50),
        nullable=False,
        default="pendente",
        index=True
    )
    notes = Column(Text, nullable=True)
    
    # Auditoria
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    delivered_at = Column(DateTime, nullable=True)
    
    # Relacionamentos
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    
    # Constraints
    __table_args__ = (
        CheckConstraint('subtotal >= 0', name='check_subtotal_positive'),
        CheckConstraint('delivery_fee >= 0', name='check_delivery_fee_positive'),
        CheckConstraint('total >= 0', name='check_total_positive'),
        CheckConstraint('cashback_amount >= 0', name='check_cashback_positive'),
        CheckConstraint('total = subtotal + delivery_fee', name='check_total_calculation'),
        Index('idx_store_created', 'store_id', 'created_at'),
        Index('idx_status_created', 'status', 'created_at'),
        Index('idx_customer_phone', 'customer_phone'),
    )
    
    def __repr__(self) -> str:
        """Representação em string do pedido."""
        return f"<Order(code={self.order_code}, store_id={self.store_id}, total={self.total})>"
    
    @property
    def is_pending(self) -> bool:
        """Verificar se o pedido está pendente."""
        return self.status == "pendente"
    
    @property
    def is_confirmed(self) -> bool:
        """Verificar se o pedido foi confirmado."""
        return self.status == "confirmado"
    
    @property
    def is_delivered(self) -> bool:
        """Verificar se o pedido foi entregue."""
        return self.status == "entregue"
    
    @property
    def is_cancelled(self) -> bool:
        """Verificar se o pedido foi cancelado."""
        return self.status == "cancelado"
    
    def calculate_cashback(self, cashback_percentage: float = 0.05) -> float:
        """
        Calcular valor de cashback baseado no subtotal.
        
        Args:
            cashback_percentage: Percentual de cashback (padrão 5%)
        
        Returns:
            float: Valor do cashback
        """
        return float(self.subtotal) * cashback_percentage


class OrderItem(Base):
    """
    Modelo de Item do Pedido.
    
    Representa um item (produto) dentro de um pedido.
    
    Attributes:
        id: Identificador único do item
        order_id: ID do pedido ao qual pertence
        product_id: ID do produto
        product_name: Nome do produto (snapshot no momento do pedido)
        quantity: Quantidade do produto
        unit_price: Preço unitário do produto (snapshot no momento do pedido)
        total: Valor total do item (quantity * unit_price)
        order: Relacionamento com o pedido
    """
    
    __tablename__ = "order_items"
    
    # Campos principais
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Informações do produto
    product_id = Column(Integer, nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    
    # Relacionamentos
    order = relationship("Order", back_populates="items")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_quantity_positive'),
        CheckConstraint('unit_price >= 0', name='check_unit_price_positive'),
        CheckConstraint('total >= 0', name='check_item_total_positive'),
        CheckConstraint('total = quantity * unit_price', name='check_item_total_calculation'),
        Index('idx_order_product', 'order_id', 'product_id'),
    )
    
    def __repr__(self) -> str:
        """Representação em string do item."""
        return f"<OrderItem(order_id={self.order_id}, product={self.product_name}, qty={self.quantity})>"