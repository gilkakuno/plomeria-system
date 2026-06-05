# 🔧 Plomería Pro — Sistema de Gestión

Sistema profesional de gestión para empresa de plomería. Construido con **NestJS** (backend), **React + Vite** (frontend) y **PostgreSQL** (base de datos).

---

## 📋 Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| 🔐 Auth | Login con JWT, reCAPTCHA v3, validación fuerza de contraseña |
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
git clone https://github.com/TU_USUARIO/plomeria-pro.git
cd plomeria-pro

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus claves

# 3. Levantar todo con Docker
docker-compose up --build -d

# 4. Ver logs
docker-compose logs -f

# 5. Acceder
# Frontend: http://localhost:80
# Backend API: http://localhost:3000
# Swagger Docs: http://localhost:3000/api/docs
```

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
cp .env.example .env
# Configurar .env con tu PostgreSQL local
npm run start:dev
# API disponible en http://localhost:3000
# Docs Swagger en http://localhost:3000/api/docs
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api
npm run dev
# App disponible en http://localhost:5173
```

### Base de datos local

```bash
# Con Docker solo PostgreSQL:
docker run -d \
  --name plomeria_db \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=plomeria_db \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## 🐳 Docker

### Construir imágenes individualmente

```bash
# Backend
docker build -t plomeria-backend ./backend

# Frontend
docker build \
  --build-arg VITE_API_URL=http://localhost:3000/api \
  -t plomeria-frontend ./frontend
```

### Docker Compose con pgAdmin (desarrollo)

```bash
docker-compose --profile dev up -d
# pgAdmin en http://localhost:5050
# Email: admin@plomeria.com | Password: admin123
```

---

## ☸️ Kubernetes

### Requisitos previos

```bash
# Instalar kubectl y minikube (local) o usar un cluster en nube
# Instalar Ingress Controller NGINX:
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### Despliegue completo

```bash
# 1. Subir imágenes al registro (Docker Hub o privado)
docker tag plomeria-backend TU_USUARIO/plomeria-backend:latest
docker push TU_USUARIO/plomeria-backend:latest

docker tag plomeria-frontend TU_USUARIO/plomeria-frontend:latest
docker push TU_USUARIO/plomeria-frontend:latest

# 2. Actualizar nombres de imagen en k8s/03-backend.yaml y k8s/04-frontend.yaml

# 3. Aplicar todos los manifiestos en orden
kubectl apply -f k8s/00-namespace-configmap.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-postgres.yaml
kubectl apply -f k8s/03-backend.yaml
kubectl apply -f k8s/04-frontend.yaml
kubectl apply -f k8s/05-ingress.yaml

# 4. Verificar estado
kubectl get pods -n plomeria
kubectl get services -n plomeria
kubectl get ingress -n plomeria

# 5. Ver logs de un pod
kubectl logs -f deployment/backend -n plomeria
```

### Minikube (local)

```bash
minikube start
minikube addons enable ingress

# Agregar al /etc/hosts:
# 192.168.49.2  plomeria.local   (IP de minikube: minikube ip)

kubectl apply -f k8s/
# Acceder en http://plomeria.local
```

---

## 🔒 Seguridad implementada

- **JWT** con expiración de 8h y validación de usuario activo
- **Contraseñas bcrypt** con salt factor 12
- **Validación de fuerza** de contraseña (débil/intermedio/fuerte)
- **reCAPTCHA v3** en formulario de login
- **Eliminación lógica** (soft delete con `deletedAt`) en todos los módulos
- **Guards de roles** (Admin/Técnico) en endpoints sensibles
- **Throttling** global: máx. 100 req/min por IP
- **Helmet** + CORS configurado en NestJS
- **Log de acceso** completo con IP, Browser, Usuario, Evento

---

## 📊 Stack Tecnológico

### Backend
- **NestJS 10** — Framework Node.js modular
- **TypeORM** — ORM con PostgreSQL
- **Passport + JWT** — Autenticación
- **pdfmake** — Generación de PDFs
- **Swagger/OpenAPI** — Documentación automática
- **bcryptjs** — Hash de contraseñas
- **class-validator** — Validación de DTOs

### Frontend
- **React 18** + **Vite** — SPA moderna y rápida
- **React Router 6** — Navegación
- **Zustand** — Estado global (auth)
- **React Hook Form** — Formularios con validación
- **Chart.js** + **react-chartjs-2** — Gráficos estadísticos
- **Lucide React** — Iconografía
- **Axios** — Cliente HTTP
- **React Hot Toast** — Notificaciones
- **Tailwind CSS** — Utilidades CSS + estilos personalizados

### Infraestructura
- **PostgreSQL 16** — Base de datos
- **Docker** + **Docker Compose** — Contenedores
- **Kubernetes** — Orquestación (HPA, Ingress, StatefulSet)
- **Nginx** — Servidor web / proxy reverso

---

## 📁 Estructura del Proyecto

```
plomeria-system/
├── backend/
│   ├── src/
│   │   ├── auth/           # Login, JWT, reCAPTCHA
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
│   │   ├── pages/          # Dashboard, Inventory, Clients...
│   │   ├── services/       # api.ts (Axios)
│   │   └── store/          # authStore (Zustand)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker/
│   └── init.sql
├── k8s/
│   ├── 00-namespace-configmap.yaml
│   ├── 01-secrets.yaml
│   ├── 02-postgres.yaml
│   ├── 03-backend.yaml
│   ├── 04-frontend.yaml
│   └── 05-ingress.yaml
├── docker-compose.yml
└── README.md
```

---

## 🌐 Despliegue Gratuito

### Opción 1: Railway (recomendado)
1. Conectar GitHub en [railway.app](https://railway.app)
2. Crear proyecto → Add PostgreSQL
3. Deploy backend y frontend como servicios separados
4. Configurar variables de entorno

### Opción 2: Render
1. Conectar GitHub en [render.com](https://render.com)
2. Crear Web Service para backend (Node)
3. Crear Static Site para frontend
4. Agregar PostgreSQL managed

### Opción 3: Fly.io
```bash
fly launch --dockerfile backend/Dockerfile
fly postgres create
fly secrets set DB_PASSWORD=... JWT_SECRET=...
fly deploy
```

---

## 📝 Variables de Entorno

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=plomeria_db
JWT_SECRET=secreto_muy_seguro_cambiar
JWT_EXPIRATION=8h
RECAPTCHA_SECRET_KEY=tu_key_de_google
OPENAI_API_KEY=tu_key_openai
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_RECAPTCHA_SITE_KEY=tu_site_key
```

---

© 2024 Plomería Pro — Sistema de Gestión Profesional
