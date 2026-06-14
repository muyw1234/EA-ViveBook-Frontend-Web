# ETAPA 1: Construcción (Build)
FROM node:20-alpine AS build-step

WORKDIR /app

ARG VITE_API_URL=http://localhost:1337
ARG VITE_SOCKET_URL=http://localhost:1337

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Copiamos dependencias
COPY package*.json ./

# Instalamos
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos la aplicación de Vite
RUN npm run build

# ETAPA 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

# En Vite, el resultado del build va por defecto a la carpeta /dist
COPY --from=build-step /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 del servidor Nginx
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]
