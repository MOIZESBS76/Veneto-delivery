# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do banco de dados
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://pizza_user:pizza_password@localhost:5432/pizza_db"
)

# Criar engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Mudar para True para ver SQL queries
    pool_pre_ping=True,  # Verificar conexão antes de usar
    pool_size=10,
    max_overflow=20
)

# Criar session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ✅ CRIAR BASE PARA MODELOS
Base = declarative_base()

# ✅ FUNÇÃO PARA OBTER SESSÃO DO BANCO
def get_db():
    """
    Dependency para obter sessão do banco de dados.
    
    Yields:
        Session: Sessão do banco de dados
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ FUNÇÃO PARA CRIAR TABELAS
def create_tables():
    """
    Criar todas as tabelas no banco de dados.
    """
    Base.metadata.create_all(bind=engine)

# ✅ FUNÇÃO PARA VERIFICAR CONEXÃO
def check_database_connection():
    """
    Verificar se a conexão com o banco de dados está funcionando.
    
    Returns:
        bool: True se conectado, False caso contrário
    """
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco de dados: {e}")
        return False