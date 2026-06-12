import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  { ignores: ['node_modules/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettier,
  {
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': [
        'error',
        {
          forbid: [
            {
              char: "'",
              alternatives: ['&apos;'],
            },
            {
              char: '"',
              alternatives: ['&quot;'],
            },
          ],
        },
      ],
      'react/jsx-key': 'off',
    },
  },
]);

// Mirar la documentació a https://eslint.org/docs/latest/rules

// https://prettier.io/docs/install
