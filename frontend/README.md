# 🍕 Pizza Delivery - Pizzaria Veneto

Sistema de delivery com PWA, WhatsApp e Cashback para pequenas pizzarias.

## 🎯 Objetivo

Criar um canal próprio para pizzarias reduzir dependência do iFood e aumentar fidelidade dos clientes através de cashback e programa de pontos.

## 🚀 Funcionalidades

- ✅ **PWA Responsivo** - Funciona como app no celular
- ✅ **Cardápio Dinâmico** - Gerenciamento de produtos e categorias
- ✅ **Carrinho Persistente** - Salva itens no localStorage
- ✅ **Checkout via WhatsApp** - Pedido formatado e enviado automaticamente
- ✅ **Cashback** - 5% de desconto em cada compra
- ✅ **Responsivo** - Mobile-first design

## 📋 Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **API Client:** Fetch API

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **Cache:** Redis
- **ORM:** SQLAlchemy

### DevOps
- **Containerização:** Docker & Docker Compose
- **Versionamento:** Git & GitHub

## 🏗️ Estrutura do Projeto
pizza-delivery/
├── frontend/                 # Next.js PWA
│   ├── app/                 # App Router
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários e hooks
│   └── public/              # Assets estáticos
├── backend/                 # FastAPI
│   ├── app/                 # Aplicação principal
│   ├── app/routers/         # Endpoints da API
│   ├── app/services/        # Lógica de negócio
│   └── app/models/          # Modelos de dados
├── docker-compose.yml       # Orquestração de containers
└── README.md               # Este arquivo
## 🚀 Como Executar Localmente

### Pré-requisitos
- Docker & Docker Compose
- Node.js 18+ (para desenvolvimento)
- Python 3.11+ (para desenvolvimento)

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/pizza-delivery.git
cd pizza-delivery
Inicie os containers:
docker-compose up -d
Acesse a aplicação:

Frontend: http://localhost:3000
Backend: http://localhost:8000
Documentação da API: http://localhost:8000/docs

Teste o fluxo:

Abra http://localhost:3000
Adicione produtos ao carrinho
Vá para checkout
Envie pedido via WhatsApp

📱 Testar no Celular (Local)
Descubra o IP da sua máquina:
bash123ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig                # Windows (procure por IPv4)ipconfig getifaddr en0  # macOS
hostname -I             # Linux
ipconfig                # Windows (procure por IPv4)
Acesse no celular (mesma rede WiFi):
http://SEU_IP:3000🌐 DeployOpção 1: Vercel (Recomendado para Frontend)
Acesse https://vercel.com
Conecte seu repositório GitHub
Configure variáveis de ambiente
Deploy automático
Opção 2: Railway (Backend + Frontend)
Acesse https://railway.app
Conecte seu repositório GitHub
Configure serviços (PostgreSQL, Redis, Backend, Frontend)
Deploy automático
Opção 3: Heroku (Backend)
Acesse https://heroku.com
Crie novo app
Conecte repositório GitHub
Configure variáveis de ambiente
Deploy automático
🔐 Variáveis de AmbienteFrontend (.env.local)NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1Backend (.env)DATABASE_URL=postgresql://pizza_user:pizza_password@localhost:5432/pizza_delivery
REDIS_URL=redis://localhost:6379
ENVIRONMENT=development📊 Dados de TesteO banco vem pré-populado com:
1 Loja: Pizzaria Veneto
6 Categorias: Pizzas Clássicas, Especiais, Esfihas, Massas, Bebidas, Sobremesas
30 Produtos: 5 de cada categoria
3 Usuários: Para testes
🧪 TestesFrontendbash12cd frontend
npm testcd frontend
npm testBackendbash12cd backend
pytestcd backend
pytest📝 Documentação da APIAcesse http://localhost:8000/docs para ver a documentação interativa da API.🤝 Contribuindo
Fork o projeto
Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)
Commit suas mudanças (git commit -m 'Add some AmazingFeature')
Push para a branch (git push origin feature/AmazingFeature)
Abra um Pull Request
📄 LicençaEste projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.👨‍💻 AutorDesenvolvido por Moizes 📞 SuportePara dúvidas ou sugestões, abra uma issue no repositório.Última atualização: 13/03/2026
---
