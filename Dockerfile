# ============================================================================
# BUILD STAGE - Compilar dependências
# ============================================================================
FROM python:3.11-slim as builder

WORKDIR /app

# Instalar dependências do sistema necessárias para build
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar APENAS requirements.txt (caminho absoluto do contexto)
COPY backend/requirements.txt ./requirements.txt

# Instalar dependências Python em diretório isolado
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================================================
# RUNTIME STAGE - Imagem final
# ============================================================================
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema (runtime)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependências Python do builder
COPY --from=builder /root/.local /root/.local

# Definir PATH para usar dependências do builder
ENV PATH=/root/.local/bin:$PATH

# Copiar código da aplicação do backend
COPY backend/ .

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Comando de inicialização
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]