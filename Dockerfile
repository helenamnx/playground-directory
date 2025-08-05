# Base para construir
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Re-create non-root user for Docker
RUN addgroup --system --gid 1001 mnx
RUN adduser --system --uid 1001 mnx

# Instala solo dependencias necesarias para construir (incluye devDeps)
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copia el resto del código fuente
COPY . .

# Compila el proyecto NestJS
RUN npm run build


# -------------------------------
# Imagen final solo con lo necesario
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Instala solo dependencias de producción
COPY package*.json ./
ENV NODE_ENV=pre-production
# COPY --from=build /usr/src/app .

# Copia solo lo necesario desde builder
COPY --from=builder /usr/src/app .



# Comando para producción
CMD ["npm", "run", "pre-production"]
