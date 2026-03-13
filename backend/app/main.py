# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
from .database import engine, create_tables
from .models.store import Base as StoreBase
from .routers import products, orders

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ✅ Criar tabelas
try:
    create_tables()
    logger.info("✅ Tabelas criadas/verificadas com sucesso")
except Exception as e:
    logger.error(f"❌ Erro ao criar tabelas: {e}")

# Criar aplicação FastAPI
app = FastAPI(
    title="Pizza Delivery API",
    description="API para gerenciar deliveries de pizzaria",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Tratamento de erros de validação
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    logger.error(f"Erro de validação: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body
        }
    )

# ✅ Tratamento de erros genéricos
@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    logger.error(f"Erro geral: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor"}
    )

# ✅ Middleware para logging
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"📨 {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"📤 {request.method} {request.url.path} - Status: {response.status_code}")
    return response

# ✅ Rotas
app.include_router(products.router, prefix="/api/v1", tags=["products"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])

# ✅ Health check
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Pizza Delivery API",
        "version": "0.1.0"
    }

@app.get("/")
def read_root():
    return {
        "message": "Bem-vindo à Pizza Delivery API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }

# ✅ Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Aplicação iniciada com sucesso")
    logger.info(f"📚 Documentação disponível em: http://localhost:8000/docs")

# ✅ Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Aplicação encerrada")