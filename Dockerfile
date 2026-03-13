# ============================================================================
# BUILD STAGE
# ============================================================================
FROM python:3.11-slim as builder

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements do backend (CAMINHO CORRETO)
COPY backend/requirements.txt ./requirements.txt

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================================
# RUNTIME STAGE
# ============================================================================
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema (runtime)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependências do builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar código da aplicação do backend (CAMINHO CORRETO)
COPY backend/ .

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Comando de inicialização
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]