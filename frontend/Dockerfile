# ── Stage 1: Build ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass build-time env vars
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_RECAPTCHA_SITE_KEY=YOUR_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

RUN npm run build

# ── Stage 2: Serve with Nginx ───────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
