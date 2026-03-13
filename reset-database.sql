-- ============================================================================
-- RESET DATABASE - PIZZARIA VENETO
-- Remove todos os dados e reseta sequências
-- ============================================================================

-- Desabilitar constraints temporariamente
ALTER TABLE order_items DISABLE TRIGGER ALL;
ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE products DISABLE TRIGGER ALL;
ALTER TABLE categories DISABLE TRIGGER ALL;
ALTER TABLE stores DISABLE TRIGGER ALL;
ALTER TABLE users DISABLE TRIGGER ALL;

-- Deletar todos os dados
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM stores;
DELETE FROM users;

-- Resetar sequências
ALTER SEQUENCE stores_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;

-- Reabilitar constraints
ALTER TABLE order_items ENABLE TRIGGER ALL;
ALTER TABLE orders ENABLE TRIGGER ALL;
ALTER TABLE products ENABLE TRIGGER ALL;
ALTER TABLE categories ENABLE TRIGGER ALL;
ALTER TABLE stores ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;

-- ============================================================================
-- LOJA: PIZZARIA VENETO (ÚNICA)
-- ============================================================================
INSERT INTO stores (id, name, description, phone, whatsapp, address, city, state, zip_code, delivery_fee, min_order, is_active, created_at, updated_at)
VALUES 
(1, 'Pizzaria Veneto', 'Autêntica pizza italiana em Maricá', '(21) 3333-3333', '5521988559703', 'Rodovia Amaral Peixoto, Km 22,5 (ao lado do Mercado Rede Economia)', 'Maricá', 'RJ', '24900-000', 5.00, 30.00, true, NOW(), NOW());

-- ============================================================================
-- CATEGORIAS: PIZZARIA VENETO (6 categorias)
-- ============================================================================
INSERT INTO categories (store_id, name, description, icon, "order", is_active, created_at)
VALUES 
(1, 'Pizzas Clássicas', 'Nossas pizzas mais populares e tradicionais', '🍕', 1, true, NOW()),
(1, 'Pizzas Especiais', 'Criações exclusivas do chef com ingredientes premium', '👨‍🍳', 2, true, NOW()),
(1, 'Esfihas', 'Esfihas assadas e crocantes', '🥐', 3, true, NOW()),
(1, 'Massas', 'Massas frescas com molhos caseiros', '🍝', 4, true, NOW()),
(1, 'Bebidas', 'Refrigerantes, sucos e bebidas geladas', '🥤', 5, true, NOW()),
(1, 'Sobremesas', 'Doces e sobremesas irresistíveis', '🍰', 6, true, NOW());

-- ============================================================================
-- PRODUTOS: PIZZAS CLÁSSICAS (5 produtos)
-- ============================================================================
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 1, 'Pizza Margherita', 'Tomate, mozzarela fresca e manjericão', 35.00, '🍕', true, 1, NOW(), NOW()),
(1, 1, 'Pizza Calabresa', 'Calabresa, cebola e mozzarela derretida', 38.00, '🍕', true, 2, NOW(), NOW()),
(1, 1, 'Pizza Portuguesa', 'Presunto, ovo, cebola e azeitona preta', 40.00, '🍕', true, 3, NOW(), NOW()),
(1, 1, 'Pizza Frango com Catupiry', 'Frango desfiado e catupiry cremoso', 42.00, '🍕', true, 4, NOW(), NOW()),
(1, 1, 'Pizza Quatro Queijos', 'Mozzarela, gorgonzola, parmesão e provolone', 45.00, '🍕', true, 5, NOW(), NOW());

-- ============================================================================
-- PRODUTOS: PIZZAS ESPECIAIS (5 produtos)
-- ============================================================================
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 2, 'Pizza Trufa', 'Mozzarela, presunto de Parma e trufa negra', 65.00, '🍕', true, 1, NOW(), NOW()),
(1, 2, 'Pizza Frutos do Mar', 'Camarão, lula e peixe fresco com alho', 70.00, '🍕', true, 2, NOW(), NOW()),
(1, 2, 'Pizza Vegetariana', 'Brócolis, tomate, cebola, pimentão e azeitona', 38.00, '🍕', true, 3, NOW(), NOW()),
(1, 2, 'Pizza Bacon e Cheddar', 'Bacon crocante e cheddar derretido', 48.00, '🍕', true, 4, NOW(), NOW()),
(1, 2, 'Pizza Picante', 'Calabresa, jalapeño, pimenta vermelha e cebola roxa', 42.00, '🍕', true, 5, NOW(), NOW());

-- ============================================================================
-- PRODUTOS: ESFIHAS (5 produtos)
-- ============================================================================
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 3, 'Esfiha de Carne', 'Carne moída temperada com especiarias', 4.50, '🥐', true, 1, NOW(), NOW()),
(1, 3, 'Esfiha de Queijo', 'Queijo derretido com orégano', 4.00, '🥐', true, 2, NOW(), NOW()),
(1, 3, 'Esfiha de Frango', 'Frango desfiado com cebola e tempero', 4.50, '🥐', true, 3, NOW(), NOW()),
(1, 3, 'Esfiha de Espinafre', 'Espinafre fresco com queijo e alho', 4.50, '🥐', true, 4, NOW(), NOW()),
(1, 3, 'Esfiha de Calabresa', 'Calabresa picada com cebola e mozzarela', 5.00, '🥐', true, 5, NOW(), NOW());

-- ============================================================================
-- PRODUTOS: MASSAS (5 produtos)
-- ============================================================================
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 4, 'Pasta à Carbonara', 'Receita romana autêntica com bacon e parmesão', 45.00, '🍝', true, 1, NOW(), NOW()),
(1, 4, 'Lasanha à Bolonhesa', 'Lasanha caseira com molho de carne', 38.00, '🍝', true, 2, NOW(), NOW()),
(1, 4, 'Penne ao Molho Vermelho', 'Penne com molho de tomate fresco e manjericão', 35.00, '🍝', true, 3, NOW(), NOW()),
(1, 4, 'Fettuccine Alfredo', 'Fettuccine com molho cremoso de parmesão', 42.00, '🍝', true, 4, NOW(), NOW()),
(1, 4, 'Ravioli de Ricota', 'Ravioli caseiro com ricota e espinafre', 40.00, '🍝', true, 5, NOW(), NOW());

-- ============================================================================
-- PRODUTOS: BEBIDAS (5 produtos)
-- ============================================================================
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 5, 'Refrigerante 2L', 'Coca-Cola, Guaraná ou Fanta (escolha o sabor)', 12.00, '🥤', true, 1, NOW(), NOW()),
(1, 5, 'Refrigerante Lata', 'Coca-Cola, Guaraná ou Fanta (lata 350ml)', 5.00, '🥤', true, 2, NOW(), NOW()),
(1, 5, 'Suco Natural', 'Laranja, maçã ou melancia (copo 500ml)', 8.00, '🥤', true, 3, NOW(), NOW()),
(1, 5, 'Água Mineral', 'Água mineral com gás ou sem gás (1,5L)', 6.00, '🥤', true, 4, NOW(), NOW()),
(1, 5, 'Cerveja Artesanal', 'Cerveja gelada (garrafa 600ml)', 15.00, '🥤', true, 5, NOW(), NOW());

-- ============================================================================
-- PRODUTOS: SOBREMESAS (5 produtos)
-- ============================================================================
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 6, 'Brownie de Chocolate', 'Brownie quente com sorvete de baunilha', 18.00, '🍰', true, 1, NOW(), NOW()),
(1, 6, 'Tiramisu', 'Clássico italiano com mascarpone e café', 16.00, '🍰', true, 2, NOW(), NOW()),
(1, 6, 'Pavê de Chocolate', 'Pavê cremoso com chocolate derretido', 14.00, '🍰', true, 3, NOW(), NOW()),
(1, 6, 'Sorvete Artesanal', 'Sorvete caseiro (escolha o sabor)', 12.00, '🍰', true, 4, NOW(), NOW()),
(1, 6, 'Mousse de Maracujá', 'Mousse leve e refrescante de maracujá', 13.00, '🍰', true, 5, NOW(), NOW());

-- ============================================================================
-- USUÁRIOS DE TESTE (CLIENTES)
-- ============================================================================
INSERT INTO users (name, email, phone, address, cashback_balance, is_active, created_at, updated_at)
VALUES 
('João Silva', 'joao@example.com', '(21) 98765-4321', 'Rua das Flores, 100, Maricá', 0.00, true, NOW(), NOW()),
('Maria Santos', 'maria@example.com', '(21) 98765-4322', 'Av. Atlântica, 200, Maricá', 0.00, true, NOW(), NOW()),
('Pedro Oliveira', 'pedro@example.com', '(21) 98765-4323', 'Rua do Comércio, 300, Maricá', 0.00, true, NOW(), NOW());

-- ============================================================================
-- FIM DO RESET - DADOS CORRETOS INSERIDOS
-- ============================================================================
-- Total de registros:
-- - Lojas: 1 (Pizzaria Veneto)
-- - Categorias: 6
-- - Produtos: 30 (5 de cada categoria)
-- - Usuários: 3
-- ============================================================================