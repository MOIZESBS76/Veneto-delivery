-- ============================================================================
-- SCRIPT DE LIMPEZA - PIZZARIA VENETO
-- Remove todos os dados da Pizzaria Veneto mantendo a estrutura
-- ============================================================================

-- Desabilitar constraints temporariamente
ALTER TABLE order_items DISABLE TRIGGER ALL;
ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE products DISABLE TRIGGER ALL;
ALTER TABLE categories DISABLE TRIGGER ALL;
ALTER TABLE stores DISABLE TRIGGER ALL;

-- Deletar dados da Pizzaria Veneto (store_id = 1)
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id = 1);
DELETE FROM orders WHERE store_id = 1;
DELETE FROM products WHERE store_id = 1;
DELETE FROM categories WHERE store_id = 1;
DELETE FROM stores WHERE id = 1;

-- Deletar usuários de teste
DELETE FROM users WHERE email IN ('joao@example.com', 'maria@example.com', 'pedro@example.com');

-- Reabilitar constraints
ALTER TABLE order_items ENABLE TRIGGER ALL;
ALTER TABLE orders ENABLE TRIGGER ALL;
ALTER TABLE products ENABLE TRIGGER ALL;
ALTER TABLE categories ENABLE TRIGGER ALL;
ALTER TABLE stores ENABLE TRIGGER ALL;

-- Resetar sequências (auto-increment)
ALTER SEQUENCE stores_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- ============================================================================
-- FIM DA LIMPEZA
-- ============================================================================