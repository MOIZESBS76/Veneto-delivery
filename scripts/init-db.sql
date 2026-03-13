-- ============================================================================
-- INICIALIZAÇÃO DO BANCO DE DADOS
-- ============================================================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar schema
CREATE SCHEMA IF NOT EXISTS public;

-- Comentário
COMMENT ON SCHEMA public IS 'Pizza Delivery System - Schema Principal';

-- ============================================================================
-- FIM DA INICIALIZAÇÃO
-- ============================================================================