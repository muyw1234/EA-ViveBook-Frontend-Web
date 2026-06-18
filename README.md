# ViveBook Frontend Web

Frontend web de ViveBook, una plataforma orientada a la comunidad lectora para descubrir, comprar, alquilar, reservar y recomendar libros, participar en eventos, gestionar una biblioteca personal y comunicarse con otros usuarios.

La aplicacion esta construida con React, TypeScript y Vite. Consume una API HTTP externa y un servidor Socket.IO, ambos configurables mediante variables publicas de Vite.

## Tabla De Contenidos

- [Estado del proyecto](#estado-del-proyecto)
- [Stack tecnico](#stack-tecnico)
- [Funcionalidades principales](#funcionalidades-principales)
- [Arquitectura general](#arquitectura-general)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Configuracion de entorno](#configuracion-de-entorno)
- [Instalacion y ejecucion local](#instalacion-y-ejecucion-local)
- [Scripts disponibles](#scripts-disponibles)
- [Testing](#testing)
- [Calidad de codigo](#calidad-de-codigo)
- [Docker](#docker)
- [Integracion continua y despliegue](#integracion-continua-y-despliegue)
- [Rutas de la aplicacion](#rutas-de-la-aplicacion)
- [Integracion con backend](#integracion-con-backend)
- [Gestion de sesion](#gestion-de-sesion)
- [Internacionalizacion](#internacionalizacion)
- [Observabilidad](#observabilidad)
- [Notas de mantenimiento](#notas-de-mantenimiento)

## Estado Del Proyecto

El proyecto contiene una aplicacion web funcional con:

- autenticacion local y social simulada;
- rutas publicas y privadas;
- catalogo de libros y eventos;
- buscador con filtros;
- detalle de libro;
- wishlist y favoritos;
- biblioteca personal paginada;
- perfil de usuario editable;
- retos/logros;
- buzon de mensajes, reservas y chats;
- integracion con Socket.IO;
- integracion con Matomo;
- test unitarios/de integracion con Vitest, Testing Library y MSW;
- test E2E con Playwright;
- build de produccion con Vite;
- imagen Docker servida con Nginx.

## Stack Tecnico

### Runtime y build

- React 19
- TypeScript
- Vite 8
- React Router DOM 7
- Axios

### UI, mapas y experiencia

- CSS modular por componente
- React Toastify
- i18next / react-i18next
- Leaflet / React Leaflet

### Comunicacion

- API HTTP REST mediante Axios
- Socket.IO Client
- JWT en `localStorage`

### Analitica

- `matomo-tracker-for-react`

### Testing

- Vitest
- jsdom
- React Testing Library
- Testing Library user-event
- jest-dom
- MSW
- Playwright

### Calidad y tooling

- ESLint
- Prettier
- Husky

## Funcionalidades Principales

### Inicio y descubrimiento

La pagina principal muestra contenido destacado de la comunidad, libros recientes, secciones por tipo de operacion y accesos a busqueda, categorias, login y perfil.

### Autenticacion

La aplicacion incluye:

- registro de usuario;
- login por email y password;
- login social simulado para Google y Apple;
- persistencia de sesion con token JWT;
- caducidad y rechazo de sesion;
- rutas protegidas.

### Catalogo de libros

El usuario puede:

- consultar libros en venta;
- consultar libros en alquiler;
- buscar libros;
- filtrar por tipo, categoria y precio;
- abrir el detalle de un libro;
- solicitar reserva;
- contactar con el vendedor;
- anadir o quitar libros de wishlist;
- anadir o quitar libros de favoritos.

### Biblioteca personal

La vista `Mis Libros` permite gestionar:

- libros subidos;
- libros comprados;
- libros alquilados;
- lista de deseos;
- busqueda dentro de la biblioteca;
- edicion y eliminacion de libros propios;
- valoracion de vendedores;
- estado temporal de alquiler.

### Perfil

El perfil de usuario permite:

- visualizar informacion personal;
- editar nombre, email y descripcion;
- cambiar avatar;
- gestionar autores favoritos;
- visualizar libros favoritos;
- visualizar categorias favoritas;
- visualizar wishlist;
- visualizar eventos seguidos;
- consultar valoraciones recibidas;
- cerrar sesion;
- iniciar procesos de desactivacion o eliminacion de cuenta.

### Retos

La seccion de retos muestra:

- nivel actual del usuario;
- progreso global;
- retos completados;
- retos pendientes;
- filtro por estado;
- calculo de nivel a partir del progreso.

### Buzon

El buzon centraliza:

- chat global;
- chats privados;
- chats de eventos;
- solicitudes de contacto;
- reservas recibidas;
- reservas enviadas;
- mensajes del sistema relacionados con reservas.

### Eventos

La aplicacion tiene vistas para listar eventos, ver detalle y participar en conversaciones asociadas.

## Arquitectura General

La aplicacion sigue una arquitectura frontend por componentes:

- `src/App.tsx` define navegacion, rutas publicas, rutas privadas y proveedor de Matomo.
- `src/main.tsx` monta React en el DOM y configura el router principal.
- `src/api.ts` centraliza Axios, base URL, token JWT, unwrap de respuestas y control de sesion.
- `src/config/environment.ts` normaliza variables publicas de Vite.
- `src/Components/Services/` contiene servicios de acceso a API por dominio funcional.
- `src/Models/` contiene interfaces TypeScript compartidas.
- `src/utils/` contiene helpers de sesion, normalizacion de libros, respuestas de API y niveles.
- `src/test/` contiene setup de testing y mocks MSW.
- `tests/e2e/` contiene tests Playwright y servidor E2E programatico.

## Estructura Del Repositorio

```txt
.
|-- .github/
|   `-- workflows/
|       |-- main.yml
|       `-- tests.yml
|-- .husky/
|-- public/
|-- src/
|   |-- Components/
|   |   |-- Accessibility/
|   |   |-- AIChatBox/
|   |   |-- BookDetail/
|   |   |-- Buzon/
|   |   |-- Chat/
|   |   |-- Discover/
|   |   |-- EventoDetail/
|   |   |-- HomePage/
|   |   |-- InitialPage/
|   |   |-- MyBooks/
|   |   |-- Profile/
|   |   |-- Retos/
|   |   |-- SearchPage/
|   |   `-- Services/
|   |-- Models/
|   |-- Services/
|   |-- config/
|   |-- hooks/
|   |-- test/
|   |   |-- setup.ts
|   |   `-- mocks/
|   |       |-- handlers.ts
|   |       `-- server.ts
|   |-- utils/
|   |-- App.tsx
|   |-- api.ts
|   |-- i18n.ts
|   `-- main.tsx
|-- tests/
|   `-- e2e/
|       |-- global-setup.ts
|       |-- global-teardown.ts
|       |-- search-to-detail.spec.ts
|       `-- vite-server.mjs
|-- Dockerfile
|-- nginx.conf
|-- playwright.config.ts
|-- vite.config.ts
|-- eslint.config.ts
|-- package.json
`-- tsconfig*.json
```

## Requisitos Previos

Se recomienda tener instalado:

- Node.js 22 o compatible con el stack actual;
- npm;
- Git;
- Docker, solo si se quiere construir la imagen de produccion;
- un backend ViveBook accesible en local o remoto.

Para comprobar versiones:

```bash
node --version
npm --version
git --version
```

## Configuracion De Entorno

La web usa variables publicas de Vite. Deben empezar por `VITE_` para que puedan ser incluidas en el bundle del navegador.

Archivo base:

```env
VITE_API_URL=http://localhost:1337
VITE_SOCKET_URL=http://localhost:1337
```

Variables:

- `VITE_API_URL`: URL base de la API HTTP.
- `VITE_SOCKET_URL`: URL base del servidor Socket.IO.

Si no se definen, la aplicacion usa `http://localhost:1337` como fallback.

Para desarrollo local se puede crear `.env.local`:

```env
VITE_API_URL=http://localhost:1337
VITE_SOCKET_URL=http://localhost:1337
```

Importante: estas variables son publicas. No deben contener secretos, passwords, tokens privados ni credenciales sensibles.

## Instalacion Y Ejecucion Local

Instalar dependencias:

```bash
npm ci
```

Levantar el frontend:

```bash
npm run dev
```

Por defecto Vite mostrara una URL local, normalmente:

```txt
http://localhost:5173
```

Para que la aplicacion funcione con datos reales, el backend configurado en `VITE_API_URL` debe estar disponible.

## Scripts Disponibles

```bash
npm run dev
```

Arranca Vite en modo desarrollo.

```bash
npm run build
```

Compila TypeScript y genera el build de produccion con Vite.

```bash
npm run preview
```

Sirve localmente el build generado por Vite.

```bash
npm run lint
```

Ejecuta ESLint.

```bash
npm run lint:quiet
```

Ejecuta ESLint mostrando solo errores.

```bash
npm run lint:fix
```

Ejecuta ESLint aplicando autofixes cuando sea posible.

```bash
npm run format
```

Formatea el repositorio con Prettier.

```bash
npm run format:check
```

Comprueba formato sin modificar archivos.

```bash
npm run test
```

Arranca Vitest en modo watch.

```bash
npm run test:run
```

Ejecuta todos los tests unitarios/de integracion una vez.

```bash
npm run test:coverage
```

Ejecuta tests con cobertura.

```bash
npm run test:e2e
```

Ejecuta los tests E2E de Playwright.

```bash
npm run test:e2e:ui
```

Abre la interfaz visual de Playwright.

## Testing

El proyecto tiene dos niveles de automatizacion:

### Tests unitarios e integracion

Tecnologias:

- Vitest;
- jsdom;
- React Testing Library;
- user-event;
- jest-dom;
- MSW.

Configuracion principal:

- `vite.config.ts`
- `src/test/setup.ts`
- `src/test/mocks/handlers.ts`
- `src/test/mocks/server.ts`

MSW simula el backend durante los tests. Esto permite probar componentes y servicios sin levantar la API real.

Ejecutar:

```bash
npm run test:run
```

Cobertura actual destacada:

- `ProtectedRoute`: redireccion cuando no hay token y acceso cuando hay token valido.
- `Login`: login correcto, login incorrecto, token y navegacion.
- `LibroService`: consulta de libros contra backend simulado.
- `BookDetail`: carga de detalle, error, wishlist y reserva.
- `SearchPage`: listado, busqueda, filtros y navegacion al detalle.
- `MyBooks`: biblioteca personal, contadores, busqueda, wishlist y navegacion.
- `Retos`: progreso, nivel y filtros.
- `Profile`: lectura de perfil, preferencias, wishlist, eventos, edicion y logout.

### Tests E2E

Tecnologias:

- Playwright;
- Chromium;
- Vite server programatico para E2E.

Configuracion:

- `playwright.config.ts`
- `tests/e2e/vite-server.mjs`
- `tests/e2e/global-setup.ts`
- `tests/e2e/global-teardown.ts`

El servidor E2E se arranca en:

```txt
http://127.0.0.1:4179
```

Playwright intercepta peticiones HTTP con `page.route`, por lo que el flujo E2E no necesita backend real para los casos cubiertos.

Ejecutar:

```bash
npm run test:e2e
```

Test E2E actual:

- abrir `/search`;
- listar libros;
- buscar un libro;
- abrir el detalle;
- validar URL, titulo, autor e ISBN.

Si Playwright se acaba de instalar en una maquina nueva, puede ser necesario descargar Chromium:

```bash
npx playwright install chromium
```

## Calidad De Codigo

El proyecto usa ESLint y Prettier.

Comandos recomendados antes de entregar cambios:

```bash
npm run format:check
npm run lint
npm run test:run
npm run test:e2e
```

Tambien se puede aplicar formato automaticamente:

```bash
npm run format
```

El repositorio incluye Husky para hooks de Git. Actualmente los hooks internos de `.husky/_` son gestionados por Husky y no deberian editarse manualmente salvo que se tenga claro el flujo.

## Docker

El proyecto incluye un `Dockerfile` multi-stage:

1. build con Node Alpine;
2. servidor de produccion con Nginx Alpine.

Construccion local:

```bash
docker build `
  --build-arg VITE_API_URL=http://localhost:1337 `
  --build-arg VITE_SOCKET_URL=http://localhost:1337 `
  -t vivebook-web .
```

Ejecutar contenedor:

```bash
docker run --rm -p 8080:80 vivebook-web
```

La aplicacion quedara disponible en:

```txt
http://localhost:8080
```

Para produccion, usar URLs reales:

```bash
docker build `
  --build-arg VITE_API_URL=https://api.example.com `
  --build-arg VITE_SOCKET_URL=https://api.example.com `
  -t vivebook-web .
```

Nginx esta configurado para servir una SPA:

```nginx
try_files $uri $uri/ /index.html;
```

Esto permite refrescar rutas como `/profile`, `/search` o `/libros/:id` sin recibir 404 del servidor web.

## Integracion Continua Y Despliegue

El repositorio contiene un workflow existente:

```txt
.github/workflows/main.yml
```

Este workflow construye y publica una imagen Docker en Docker Hub bajo ciertas condiciones:

- push a `main`;
- ejecucion manual mediante `workflow_dispatch`;
- condicion adicional: el commit debe empezar por `v` o el workflow debe lanzarse manualmente.

Variables usadas por el workflow:

- `VITE_API_URL`
- `VITE_SOCKET_URL`

Secrets necesarios:

- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_ACCESS_TOKEN`

El workflow valida que las URLs publicas no apunten a `localhost` ni `127.0.0.1` antes de construir la imagen.

Tambien existe un workflow de tests preparado:

```txt
.github/workflows/tests.yml
```

Su objetivo es ejecutar:

- `npm ci`;
- instalacion de Chromium para Playwright;
- `npm run test:run`;
- `npm run test:e2e`.

Para que GitHub lo ejecute, el archivo debe estar commiteado y subido al repositorio. Una vez disponible en GitHub, se puede activar como requisito de merge mediante branch protection rules.

## Rutas De La Aplicacion

### Rutas publicas

| Ruta                | Descripcion                  |
| ------------------- | ---------------------------- |
| `/`                 | Home                         |
| `/home`             | Redireccion a `/`            |
| `/register`         | Registro                     |
| `/login`            | Login                        |
| `/libros/:id`       | Detalle de libro             |
| `/eventos/:id`      | Detalle de evento            |
| `/categorias/:type` | Listado por categoria o tipo |
| `/search`           | Buscador                     |

### Rutas privadas

Estas rutas estan protegidas por `ProtectedRoute` y requieren token de sesion valido.

| Ruta               | Descripcion                |
| ------------------ | -------------------------- |
| `/ia`              | Chat IA                    |
| `/discover`        | Descubrimiento social      |
| `/buzon`           | Mensajes, reservas y chats |
| `/my-books`        | Biblioteca personal        |
| `/retos`           | Retos y progreso           |
| `/profile`         | Perfil propio              |
| `/profile/:userId` | Perfil de usuario          |
| `/profile-old`     | Perfil legacy              |

## Integracion Con Backend

La API se consume mediante `src/api.ts`, que configura:

- `baseURL` desde `environment.apiUrl`;
- header `Content-Type: application/json`;
- inyeccion automatica de `Authorization: Bearer <token>`;
- redireccion a login si el token almacenado ha caducado o no es valido;
- unwrap automatico de respuestas con forma `{ success, data }`.

Patron habitual de respuesta esperado:

```json
{
  "success": true,
  "data": {}
}
```

Cuando Axios recibe esa forma, `api.ts` sustituye `response.data` por el contenido de `data`.

Servicios por dominio:

- `Libro.ts`
- `Usuario.ts`
- `Reto.ts`
- `Evento.ts`
- `Post.ts`
- `Image.ts`
- `Recomendacion.ts`

## Gestion De Sesion

La sesion se gestiona en:

```txt
src/utils/session.ts
src/hooks/useSessionToken.ts
```

Funcionamiento:

- el token se guarda en `localStorage` bajo la clave `token`;
- se decodifica con `jwt-decode`;
- si contiene `exp` y ha caducado, se limpia la sesion;
- si el token no se puede decodificar, se considera rechazado;
- se guarda una razon de sesion en `sessionStorage` cuando corresponde;
- se emite el evento `vivebook:session-changed` para actualizar la navegacion;
- `useSessionToken` escucha cambios de storage y un intervalo periodico.

## Internacionalizacion

La configuracion de i18n esta en:

```txt
src/i18n.ts
```

Idiomas incluidos:

- castellano (`es`);
- catalan (`cat`);
- ingles (`en`).

El idioma por defecto es:

```ts
lng: 'es';
```

Los componentes usan `useTranslation` para textos traducibles. Algunas pantallas aun contienen textos hardcodeados, por lo que una mejora futura seria centralizar mas cadenas en `i18n.ts`.

## Observabilidad

La aplicacion integra Matomo mediante:

```txt
matomo-tracker-for-react
```

En `App.tsx`, `MatomoProvider` envuelve las rutas principales:

```tsx
<MatomoProvider urlBase="https://ea3upc.matomo.cloud" siteId="1" path={currentPath}>
```

Esto permite enviar informacion de navegacion y eventos, como acciones relacionadas con libros.

## Notas De Mantenimiento

### Variables publicas

Las variables `VITE_*` se incluyen en el bundle. No usar para secretos.

### Tests

Al anadir nuevas pantallas, se recomienda:

1. probar helpers y servicios con Vitest;
2. probar componentes con Testing Library;
3. simular backend con MSW;
4. reservar Playwright para flujos completos de usuario.

### API

Mantener consistencia en las respuestas del backend. El frontend funciona mejor si los endpoints devuelven:

```json
{
  "success": true,
  "data": {}
}
```

### Rutas protegidas

Toda nueva ruta privada deberia ir dentro de:

```tsx
<Route element={<ProtectedRoute />}>
```

### Docker

La configuracion de backend se fija en build time. Si cambia `VITE_API_URL` o `VITE_SOCKET_URL`, hay que reconstruir la imagen.

### CI

Antes de activar branch protection, verificar que el workflow de tests ya aparece correctamente en la pestana Actions de GitHub.

## Comandos Rapidos

Instalar:

```bash
npm ci
```

Desarrollo:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Tests:

```bash
npm run test:run
npm run test:e2e
```

Lint y formato:

```bash
npm run lint
npm run format:check
```

Docker:

```bash
docker build -t vivebook-web .
docker run --rm -p 8080:80 vivebook-web
```
