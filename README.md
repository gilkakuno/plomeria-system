# 🔧 Plomería Kuno — Sistema de Gestión

Sistema profesional de gestión para empresa de plomería. Construido con **NestJS** (backend), **React + Vite** (frontend) y **PostgreSQL** (base de datos).

---

## 📋 Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| 🔐 Auth | Login con JWT, captcha simplificado (checkbox "No soy un robot"), validación de fuerza de contraseña |
| 👥 Usuarios | CRUD con roles Admin/Técnico, eliminación lógica |
| 📦 Inventario | Materiales con stock, alertas mínimas, eliminación lógica |
| 👤 Clientes | Registro y gestión de clientes |
| 📋 Proyectos | Presupuestos/contratos con lista de materiales |
| 🤖 Agente IA | Sugerencia automática de materiales con OpenAI |
| 📊 Reportes | PDF con pdfmake, gráficos con Chart.js |
| 🗒️ Logs | Registro de acceso: IP, Browser, Usuario, Evento |

---

## 🚀 Inicio Rápido

### Con Docker Compose (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/gilkakuno/plomeria-pro.git
cd plomeria-pro

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Edita backend/.env y asegura que la contraseña sea 123456 y DB_NAME=plomeria_db

# 3. Levantar todo con Docker
docker-compose up --build -d
```

Acceder:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

### Crear usuario administrador (primera vez)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@plomeria.com",
    "password": "Admin123!",
    "fullName": "Administrador",
    "role": "admin"
  }'
```

---

## 🛠️ Desarrollo Local

### Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env   # Asegúrate que DB_PASSWORD=123456 y DB_NAME=plomeria_db
npm run start:dev
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env   # Configura VITE_API_URL si usas otro puerto
npm run dev
```

### Base de datos local

```bash
# Con Docker solo PostgreSQL
docker run -d \
  --name plomeria_db \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=plomeria_db \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## 🔐 Seguridad implementada

- **JWT** con expiración de 8h y validación de usuario activo
- **Contraseñas bcrypt** con salt factor 12
- **Validación de fuerza** de contraseña (débil/intermedio/fuerte)
- **Captcha simplificado**: checkbox "No soy un robot" (para pruebas) que envía token "human" al backend
- **Eliminación lógica** (soft delete con `deletedAt`) en todos los módulos
- **Guards de roles** (Admin/Técnico) en endpoints sensibles
- **Throttling** global: máx. 100 req/min por IP
- **Helmet** + CORS configurado en NestJS
- **Log de acceso** completo con IP, Browser, Usuario, Evento

---

## 📊 Stack Tecnológico

### Backend
- NestJS 10
- TypeORM + PostgreSQL
- Passport + JWT
- pdfmake
- Swagger/OpenAPI
- bcryptjs
- class-validator

### Frontend
- React 18 + Vite
- React Router 6
- Zustand (auth store)
- React Hook Form
- Chart.js + react-chartjs-2
- Lucide React (iconos)
- Axios
- React Hot Toast
- Tailwind CSS

### Infraestructura
- PostgreSQL 16
- Docker + Docker Compose
- Kubernetes (HPA, Ingress, StatefulSet)
- Nginx (proxy reverso)

---

## 📁 Estructura del Proyecto

```text
plomeria-system/
├── backend/
│   ├── src/
│   │   ├── auth/           # Login, JWT, captcha simplificado
│   │   ├── users/          # Gestión de usuarios y roles
│   │   ├── inventory/      # Materiales con eliminación lógica
│   │   ├── clients/        # Gestión de clientes
│   │   ├── projects/       # Proyectos/contratos
│   │   ├── logs/           # Log de acceso
│   │   ├── reports/        # PDF + estadísticas
│   │   └── ai-agent/       # Agente inteligente OpenAI
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/     # Sidebar + Topbar
│   │   ├── pages/          # Dashboard, Inventory, Clients, Login, …
│   │   ├── services/       # api.ts (Axios)
│   │   └── store/          # authStore (Zustand)
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   └── init.sql
├── k8s/
│   └── …
├── docker-compose.yml
└── README.md
```

---

## 🌐 Despliegue Gratuito

### Opción 1: Railway (recomendado)
1. Conecta tu repositorio GitHub en https://railway.app
2. Añade un servicio PostgreSQL
3. Deploy backend y frontend como servicios separados
4. Configura variables de entorno (DB_PASSWORD=123456, RECAPTCHA_SECRET_KEY si lo usas, etc.)

### Opción 2: Render
1. Conecta tu repositorio en https://render.com
2. Crea Web Service para backend (Node) y Static Site para frontend
3. Añade PostgreSQL managed y establece las variables de entorno

### Opción 3: Fly.io
```bash
fly launch --dockerfile backend/Dockerfile
fly postgres create
fly secrets set DB_PASSWORD=123456 JWT_SECRET=…
fly deploy
```

---

## 📝 Variables de Entorno

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=plomeria_db
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar
JWT_EXPIRATION=8h
RECAPTCHA_SECRET_KEY=tu_key_de_google   # opcional, usado solo en producción
OPENAI_API_KEY=tu_key_openai
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_RECAPTCHA_SITE_KEY=tu_site_key   # opcional, no usado con el captcha de checkbox
```

---

© 2024 Plomería Kuno — Sistema de Gestión Profesional
