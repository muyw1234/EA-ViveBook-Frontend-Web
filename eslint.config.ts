import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**'] },
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
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
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
