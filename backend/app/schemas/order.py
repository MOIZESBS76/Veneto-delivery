# backend/app/schemas/order.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    store_id: int
    customer_name: str
    customer_phone: str
    customer_address: str
    payment_method: str
    delivery_fee: float  # ✅ ADICIONAR ISTO
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_code: str
    store_id: int
    customer_name: str
    customer_phone: str
    customer_address: str
    payment_method: str
    subtotal: float
    delivery_fee: float
    total: float
    status: str
    notes: Optional[str]
    created_at: datetime
    items: List[OrderItemCreate]

    class Config:
        from_attributes = True