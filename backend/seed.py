#!/usr/bin/env python
"""Script para popular o banco de dados com dados iniciais"""

import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal, engine
from app.models.store import Base as StoreBase
from app.models.store import Store
from app.models.product import Category, Product

# ✅ PASSO 1: CRIAR TABELAS
print("🔄 Criando tabelas no banco de dados...")
try:
    StoreBase.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!\n")
except Exception as e:
    print(f"❌ Erro ao criar tabelas: {e}")
    sys.exit(1)

# ✅ PASSO 2: FAZER SEED (POPULAR COM DADOS)
db = SessionLocal()

try:
    # Criar primeira loja
    print("Criando loja...")
    store = Store(
        name="Pizzaria Central Maricá",
        address="Rua das Flores, 123, Maricá - RJ",
        phone="(21) 98765-4321",
        whatsapp="5521987654321",
        city="Maricá",
        hours_open="17:00",
        hours_close="23:00",
        delivery_fee=5.0
    )
    db.add(store)
    db.commit()
    print(f"✅ Loja criada: {store.name} (ID: {store.id})")
    
    # Criar categorias
    print("\nCriando categorias...")
    categories = [
        Category(name="Pizzas Tradicionais", store_id=store.id),
        Category(name="Pizzas Premium", store_id=store.id),
        Category(name="Bebidas", store_id=store.id),
        Category(name="Adicionais", store_id=store.id),
    ]
    db.add_all(categories)
    db.commit()
    print(f"✅ {len(categories)} categorias criadas")
    
    # Criar produtos
    print("\nCriando produtos...")
    products = [
        # Pizzas Tradicionais
        Product(name="Margherita", description="Molho, queijo e tomate", price=35.0, category_id=categories[0].id, store_id=store.id),
        Product(name="Calabresa", description="Calabresa, cebola e orégano", price=38.0, category_id=categories[0].id, store_id=store.id),
        Product(name="Frango com Catupiry", description="Frango desfiado e catupiry cremoso", price=42.0, category_id=categories[0].id, store_id=store.id),
        
        # Pizzas Premium
        Product(name="Premium Carne", description="Carne seca, bacon e queijo meia cura", price=48.0, category_id=categories[1].id, store_id=store.id),
        Product(name="Gourmet Vegetariana", description="Abobrinha, brócolis, cenoura e tomate seco", price=45.0, category_id=categories[1].id, store_id=store.id),
        
        # Bebidas
        Product(name="Refrigerante Lata", description="Vários sabores", price=6.0, category_id=categories[2].id, store_id=store.id),
        Product(name="Suco Natural", description="Laranja ou limão", price=8.0, category_id=categories[2].id, store_id=store.id),
        
        # Adicionais
        Product(name="Borda Recheada", description="Borda com queijo ou chocolate", price=8.0, category_id=categories[3].id, store_id=store.id),
        Product(name="Molho Extra", description="Molho ou maionese", price=3.0, category_id=categories[3].id, store_id=store.id),
    ]
    db.add_all(products)
    db.commit()
    print(f"✅ {len(products)} produtos criados")
    
    print("\n" + "="*60)
    print("✅ SEED CONCLUÍDO COM SUCESSO!")
    print("="*60)
    print(f"\n📍 Store ID: {store.id}")
    print(f"🔗 Acesse a API: http://localhost:8000/api/v1/stores/{store.id}/products")
    print(f"📚 Documentação: http://localhost:8000/docs")
    print(f"❤️  Health Check: http://localhost:8000/health\n")
    
except Exception as e:
    db.rollback()
    print(f"❌ Erro ao fazer seed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()