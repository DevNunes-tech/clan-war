import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Adiciona suporte às variáveis de ambiente do Vite
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Ignora variáveis que começam com maiúscula (componentes, constantes)
      // ou com underline (variáveis intencionalmente não usadas)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      
      // Ignora o React como variável não usada (comum em projetos Vite modernos)
      'react/react-in-jsx-scope': 'off',
    },
  },
])
