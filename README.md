# React + TypeScript + Vite

## Minimo 2

En este minimo se ha continuado el desarrollo del frontend web de ViveBook, integrando la parte visual de la aplicacion con los servicios disponibles en el backend. El proyecto esta construido con React, TypeScript y Vite, y utiliza `axios` para centralizar las llamadas HTTP contra la API configurada en `src/api.ts`.

El cambio principal incorporado en esta fase ha sido la creacion de una nueva seccion de IA accesible desde el menu superior mediante la pestaña `IA`. Esta pestaña abre un chatbox propio, implementado en `src/Components/AIChatBox`, que permite al usuario escribir una consulta en lenguaje natural para pedir recomendaciones de libros. El componente llama al endpoint del backend `POST /recomendaciones`, enviando la consulta como `query` junto con un limite de resultados, y muestra la respuesta generada por el servicio de IA.

Tambien se ha creado un servicio frontend especifico en `src/Components/Services/Recomendacion.ts` para encapsular las llamadas al backend relacionadas con recomendaciones. De esta forma, el componente de interfaz no depende directamente de los detalles de `axios` ni de la ruta exacta del endpoint.

Actualmente el proyecto se encuentra en un estado funcional para desarrollo local. La aplicacion compila correctamente con:

```bash
npm run build
```

Para ejecutar el frontend en local se puede usar:

```bash
npm run dev
```

El frontend espera que el backend este disponible en `http://localhost:1337`, tal como esta definido en `src/api.ts`. Para que la pestaña `IA` funcione completamente, el backend debe estar levantado y el servicio de recomendaciones debe tener acceso al servicio de IA configurado previamente.

# Comandos

Crear nuevo proyecto con Vite con última versión: npm create vite@latest

Comando para compilar: npm run dev

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
