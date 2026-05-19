FROM node:20-alpine AS build-step
WORKDIR /app
COPY package.json ./
RUN npm install
COPY src ./src
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY public/ ./
COPY index.html ./
RUN npm run build
FROM nginx:stable-alpine
COPY --from=build-step /app/dist /usr/share/nginx/html
EXPOSE 80
#CMD ["npm","start"]
CMD ["nginx", "-g", "daemon off;"]