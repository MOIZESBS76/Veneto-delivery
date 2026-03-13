# backend/app/services/order_service.py
from sqlalchemy.orm import Session
from ..models.order import Order, OrderItem
from ..schemas.order import OrderCreate, OrderResponse
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def create_order(db: Session, order: OrderCreate) -> OrderResponse:
    """
    Criar um novo pedido com validação e tratamento de erro.
    
    Args:
        db: Sessão do banco de dados
        order: Dados do pedido (OrderCreate)
    
    Returns:
        OrderResponse: Pedido criado com sucesso
    
    Raises:
        ValueError: Se houver erro na validação
        Exception: Se houver erro ao salvar no banco
    """
    try:
        # ✅ Validar dados
        if not order.items or len(order.items) == 0:
            raise ValueError("Pedido deve conter pelo menos um item")
        
        if order.delivery_fee < 0:
            raise ValueError("Taxa de entrega não pode ser negativa")
        
        # ✅ Gerar código único do pedido
        order_code = f"ORD-{str(uuid.uuid4())[:8].upper()}"
        logger.info(f"📝 Criando pedido: {order_code}")
        
        # ✅ Calcular subtotal e total
        subtotal = sum(item.unit_price * item.quantity for item in order.items)
        total = subtotal + order.delivery_fee
        
        logger.info(f"💰 Subtotal: R$ {subtotal:.2f}, Taxa: R$ {order.delivery_fee:.2f}, Total: R$ {total:.2f}")
        
        # ✅ Criar objeto do pedido
        db_order = Order(
            order_code=order_code,
            store_id=order.store_id,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            customer_address=order.customer_address,
            payment_method=order.payment_method,
            subtotal=subtotal,
            delivery_fee=order.delivery_fee,
            total=total,
            status="pendente",  # ✅ Status inicial
            notes=order.notes,
            created_at=datetime.utcnow()  # ✅ Timestamp
        )
        
        db.add(db_order)
        db.flush()  # Obter ID do pedido
        
        logger.info(f"✅ Pedido criado no banco: ID {db_order.id}")
        
        # ✅ Criar itens do pedido
        for idx, item in enumerate(order.items, 1):
            db_item = OrderItem(
                order_id=db_order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=item.unit_price * item.quantity
            )
            db.add(db_item)
            logger.info(f"  ✓ Item {idx}: {item.quantity}x {item.product_name} - R$ {item.unit_price * item.quantity:.2f}")
        
        # ✅ Confirmar transação
        db.commit()
        db.refresh(db_order)
        
        logger.info(f"🎉 Pedido {order_code} criado com sucesso!")
        
        return db_order
    
    except ValueError as ve:
        logger.error(f"❌ Erro de validação: {str(ve)}")
        db.rollback()
        raise
    
    except Exception as e:
        logger.error(f"❌ Erro ao criar pedido: {str(e)}")
        db.rollback()
        raise


def get_order_by_code(db: Session, order_code: str) -> Order:
    """
    Buscar pedido pelo código.
    
    Args:
        db: Sessão do banco de dados
        order_code: Código do pedido (ex: ORD-ABC12345)
    
    Returns:
        Order: Pedido encontrado ou None
    """
    try:
        logger.info(f"🔍 Buscando pedido: {order_code}")
        order = db.query(Order).filter(Order.order_code == order_code).first()
        
        if order:
            logger.info(f"✅ Pedido encontrado: {order_code}")
        else:
            logger.warning(f"⚠️ Pedido não encontrado: {order_code}")
        
        return order
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar pedido: {str(e)}")
        raise


def get_orders_by_store(db: Session, store_id: int, limit: int = 50):
    """
    Buscar pedidos de uma loja.
    
    Args:
        db: Sessão do banco de dados
        store_id: ID da loja
        limit: Limite de resultados
    
    Returns:
        List[Order]: Lista de pedidos
    """
    try:
        logger.info(f"🔍 Buscando pedidos da loja {store_id}")
        orders = db.query(Order).filter(
            Order.store_id == store_id
        ).order_by(Order.created_at.desc()).limit(limit).all()
        
        logger.info(f"✅ {len(orders)} pedidos encontrados")
        return orders
    
    except Exception as e:
        logger.error(f"❌ Erro ao buscar pedidos: {str(e)}")
        raise


def update_order_status(db: Session, order_code: str, status: str):
    """
    Atualizar status do pedido.
    
    Args:
        db: Sessão do banco de dados
        order_code: Código do pedido
        status: Novo status (pendente, confirmado, entregue, cancelado)
    
    Returns:
        Order: Pedido atualizado
    """
    try:
        valid_statuses = ["pendente", "confirmado", "em_entrega", "entregue", "cancelado"]
        
        if status not in valid_statuses:
            raise ValueError(f"Status inválido. Valores válidos: {', '.join(valid_statuses)}")
        
        logger.info(f"📝 Atualizando status do pedido {order_code} para {status}")
        
        order = db.query(Order).filter(Order.order_code == order_code).first()
        
        if not order:
            raise ValueError(f"Pedido {order_code} não encontrado")
        
        order.status = status
        db.commit()
        db.refresh(order)
        
        logger.info(f"✅ Pedido {order_code} atualizado para {status}")
        return order
    
    except Exception as e:
        logger.error(f"❌ Erro ao atualizar pedido: {str(e)}")
        db.rollback()
        raise