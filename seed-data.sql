-- ============================================================================
-- SEED DATA - Pizza Delivery System
-- Dados de teste para desenvolvimento e testes
-- ============================================================================

-- ============================================================================
-- LOJAS (STORES)
-- ============================================================================
INSERT INTO stores (id, name, description, phone, whatsapp, address, city, state, zip_code, delivery_fee, min_order, is_active, created_at, updated_at)
VALUES 
(1, 'Pizzaria Veneto', 'Autêntica pizza italiana em Maricá', '(21) 3333-3333', '5521988559703', 'Rua das Flores, 123', 'Maricá', 'RJ', '24900-000', 5.00, 30.00, true, NOW(), NOW()),
(2, 'Pizzaria Napoli', 'Pizza tradicional napolitana', '(21) 3333-4444', '5521988559704', 'Av. Atlântica, 456', 'Maricá', 'RJ', '24900-100', 6.00, 35.00, true, NOW(), NOW()),
(3, 'Pizzaria Siciliana', 'Pizza siciliana e massas frescas', '(21) 3333-5555', '5521988559705', 'Rua do Comércio, 789', 'Maricá', 'RJ', '24900-200', 5.50, 25.00, true, NOW(), NOW());

-- ============================================================================
-- CATEGORIAS (CATEGORIES)
-- ============================================================================
INSERT INTO categories (store_id, name, description, icon, "order", is_active, created_at)
VALUES 
-- Loja 1 - Pizzaria Veneto
(1, 'Pizzas Clássicas', 'Nossas pizzas mais populares', '🍕', 1, true, NOW()),
(1, 'Pizzas Especiais', 'Criações exclusivas do chef', '👨‍🍳', 2, true, NOW()),
(1, 'Bebidas', 'Refrigerantes, sucos e bebidas', '🥤', 3, true, NOW()),
(1, 'Sobremesas', 'Doces e sobremesas', '🍰', 4, true, NOW()),

-- Loja 2 - Pizzaria Napoli
(2, 'Pizzas Tradicionais', 'Receitas napolitanas autênticas', '🍕', 1, true, NOW()),
(2, 'Massas', 'Massas frescas e molhos caseiros', '🍝', 2, true, NOW()),
(2, 'Bebidas', 'Bebidas geladas e quentes', '🥤', 3, true, NOW()),
(2, 'Sobremesas', 'Doces italianos', '🍰', 4, true, NOW()),

-- Loja 3 - Pizzaria Siciliana
(3, 'Pizzas Sicilianas', 'Pizza quadrada siciliana', '🍕', 1, true, NOW()),
(3, 'Pizzas Redondas', 'Pizzas redondas tradicionais', '🍕', 2, true, NOW()),
(3, 'Bebidas', 'Bebidas variadas', '🥤', 3, true, NOW()),
(3, 'Sobremesas', 'Doces e gelados', '🍰', 4, true, NOW());

-- ============================================================================
-- PRODUTOS (PRODUCTS)
-- ============================================================================
-- Loja 1 - Pizzaria Veneto
INSERT INTO products (store_id, category_id, name, description, price, image_url, is_available, "order", created_at, updated_at)
VALUES 
(1, 1, 'Pizza Margherita', 'Tomate, mozzarela fresca e manjericão', 35.00, '🍕', true, 1, NOW(), NOW()),
(1, 1, 'Pizza Calabresa', 'Calabresa, cebola e mozzarela', 38.00, '🍕', true, 2, NOW(), NOW()),
(1, 1, 'Pizza Portuguesa', 'Presunto, ovo, cebola e azeitona', 40.00, '🍕', true, 3, NOW(), NOW()),
(1, 2, 'Pizza Trufa', 'Mozzarela, presunto de Parma e trufa', 65.00, '🍕', true, 1, NOW(), NOW()),
(1, 2, 'Pizza Frutos do Mar', 'Camarão, lula e peixe fresco', 70.00, '🍕', true, 2, NOW(), NOW()),
(1, 3, 'Refrigerante 2L', 'Coca-Cola, Guaraná ou Fanta', 12.00, '🥤', true, 1, NOW(), NOW()),
(1, 3, 'Suco Natural', 'Laranja, maçã ou melancia', 8.00, '🥤', true, 2, NOW(), NOW()),
(1, 4, 'Brownie de Chocolate', 'Brownie quente com sorvete', 18.00, '🍰', true, 1, NOW(), NOW()),
(1, 4, 'Tiramisu', 'Clássico italiano', 16.00, '🍰', true, 2, NOW(), NOW()),

-- Loja 2 - Pizzaria Napoli
(2, 5, 'Pizza Napolitana', 'Receita tradicional napolitana', 42.00, '🍕', true, 1, NOW(), NOW()),
(2, 5, 'Pizza Quattro Formaggi', 'Quatro queijos premium', 48.00, '🍕', true, 2, NOW(), NOW()),
(2, 6, 'Pasta à Carbonara', 'Receita romana autêntica', 45.00, '🍝', true, 1, NOW(), NOW()),
(2, 6, 'Lasanha à Bolonhesa', 'Lasanha caseira', 38.00, '🍝', true, 2, NOW(), NOW()),
(2, 7, 'Vinho Tinto', 'Vinho italiano importado', 45.00, '🥤', true, 1, NOW(), NOW()),
(2, 8, 'Panna Cotta', 'Sobremesa italiana cremosa', 20.00, '🍰', true, 1, NOW(), NOW()),

-- Loja 3 - Pizzaria Siciliana
(3, 9, 'Pizza Siciliana Clássica', 'Pizza quadrada siciliana', 40.00, '🍕', true, 1, NOW(), NOW()),
(3, 9, 'Pizza Siciliana com Brócolis', 'Siciliana com brócolis fresco', 42.00, '🍕', true, 2, NOW(), NOW()),
(3, 10, 'Pizza Marinara', 'Tomate, alho e orégano', 32.00, '🍕', true, 1, NOW(), NOW()),
(3, 10, 'Pizza Diavola', 'Calabresa picante e mozzarela', 38.00, '🍕', true, 2, NOW(), NOW()),
(3, 11, 'Refrigerante Lata', 'Coca-Cola, Guaraná ou Fanta', 5.00, '🥤', true, 1, NOW(), NOW()),
(3, 12, 'Gelato Italiano', 'Sorvete italiano premium', 15.00, '🍰', true, 1, NOW(), NOW()),
(3, 12, 'Cannoli Siciliano', 'Doce tradicional siciliano', 12.00, '🍰', true, 2, NOW(), NOW());

-- ============================================================================
-- USUÁRIOS (USERS) - Clientes de teste
-- ============================================================================
INSERT INTO users (name, email, phone, address, cashback_balance, is_active, created_at, updated_at)
VALUES 
('João Silva', 'joao@example.com', '(21) 98765-4321', 'Rua das Flores, 100, Maricá', 0.00, true, NOW(), NOW()),
('Maria Santos', 'maria@example.com', '(21) 98765-4322', 'Av. Atlântica, 200, Maricá', 0.00, true, NOW(), NOW()),
('Pedro Oliveira', 'pedro@example.com', '(21) 98765-4323', 'Rua do Comércio, 300, Maricá', 0.00, true, NOW(), NOW());

-- ============================================================================
-- FIM DO SEED DATA
-- ============================================================================