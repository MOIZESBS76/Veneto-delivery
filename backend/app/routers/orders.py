# backend/app/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.order import Order  # ✅ IMPORTAR DO MODELS, NÃO DO SCHEMAS
from ..schemas.order import OrderCreate, OrderResponse  # ✅ IMPORTAR SCHEMAS DAQUI
from ..services.order_service import create_order, get_order_by_code

router = APIRouter()

@router.post("/orders", response_model=OrderResponse)
def create_new_order(order: OrderCreate, db: Session = Depends(get_db)):
    """
    Criar um novo pedido.
    
    Args:
        order: Dados do pedido (OrderCreate)
        db: Sessão do banco de dados
    
    Returns:
        OrderResponse: Pedido criado com sucesso
    """
    try:
        return create_order(db, order)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar pedido: {str(e)}")

@router.get("/orders/{order_code}", response_model=OrderResponse)
def get_order(order_code: str, db: Session = Depends(get_db)):
    """
    Buscar pedido pelo código.
    
    Args:
        order_code: Código do pedido (ex: ORD-ABC12345)
        db: Sessão do banco de dados
    
    Returns:
        OrderResponse: Dados do pedido
    """
    order = get_order_by_code(db, order_code)
    
    if not order:
        raise HTTPException(status_code=404, detail=f"Pedido {order_code} não encontrado")
    
    return order