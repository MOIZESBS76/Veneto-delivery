# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from datetime import datetime, timedelta
import asyncio
from .database import engine, create_tables
from .models.store import Base as StoreBase
from .routers import products, orders

# ============================================================================
# CONFIGURAÇÃO DE LOGGING
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# ============================================================================
# CRIAR TABELAS
# ============================================================================

try:
    create_tables()
    logger.info("✅ Tabelas criadas/verificadas com sucesso")
except Exception as e:
    logger.error(f"❌ Erro ao criar tabelas: {e}")

# ============================================================================
# CRIAR APLICAÇÃO FASTAPI
# ============================================================================

app = FastAPI(
    title="Pizza Delivery API",
    description="API para gerenciar deliveries de pizzaria",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ============================================================================
# MIDDLEWARE: COMPRESSÃO GZIP (para 4G)
# ============================================================================

app.add_middleware(GZIPMiddleware, minimum_size=1000)

# ============================================================================
# MIDDLEWARE: CORS (SEGURO)
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://veneto-delivery.vercel.app",  # PRODUÇÃO
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # Cache CORS por 1 hora
)

# ============================================================================
# CACHE EM MEMÓRIA
# ============================================================================

class CacheManager:
    def __init__(self):
        self.cache = {}
        self.timestamps = {}
        self.ttl_seconds = 300  # 5 minutos

    def get(self, key: str):
        if key not in self.cache:
            return None

        age = (datetime.now() - self.timestamps[key]).total_seconds()
        if age > self.ttl_seconds:
            del self.cache[key]
            del self.timestamps[key]
            return None

        return self.cache[key]

    def set(self, key: str, value):
        self.cache[key] = value
        self.timestamps[key] = datetime.now()

    def clear(self, key: str = None):
        if key:
            self.cache.pop(key, None)
            self.timestamps.pop(key, None)
        else:
            self.cache.clear()
            self.timestamps.clear()

cache_manager = CacheManager()

# ============================================================================
# TRATAMENTO DE ERROS
# ============================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    logger.error(f"❌ Erro de validação: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    logger.error(f"❌ Erro geral: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor"}
    )

# ============================================================================
# MIDDLEWARE: LOGGING
# ============================================================================

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"📨 {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"📤 {request.method} {request.url.path} - Status: {response.status_code}")
    return response

# ============================================================================
# ROTAS
# ============================================================================

app.include_router(products.router, prefix="/api/v1", tags=["products"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Pizza Delivery API",
        "version": "0.1.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/health")
def api_health_check():
    return {
        "status": "ok",
        "service": "Pizza Delivery API",
        "version": "0.1.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo à Pizza Delivery API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }

# ============================================================================
# STARTUP E SHUTDOWN
# ============================================================================

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Aplicação iniciada com sucesso")
    logger.info(f"📚 Documentação disponível em: http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Aplicação encerrada")
    cache_manager.clear()