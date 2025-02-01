// frontend/.eslintrc.js

module.exports = {
  env: {
    browser: true, // Define el entorno del navegador
    es2021: true, // Habilita las características de ECMAScript 2021
    node: true,   // Habilita el entorno de Node.js (útil si tu configuración de frontend lo utiliza)
  },
  extends: [
    'eslint:recommended', // Extiende las reglas recomendadas por ESLint
    'plugin:react/recommended', // Extiende las reglas recomendadas para React
    'plugin:react-hooks/recommended', // Extiende las reglas recomendadas para React Hooks
    'plugin:jsx-a11y/recommended', // Extiende las reglas recomendadas para accesibilidad en JSX
    'plugin:react/jsx-runtime' // Habilita la nueva transformación JSX de React 17+
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Habilita el soporte para JSX
    },
    ecVersion: 'latest', // Utiliza la versión más reciente de ECMAScript
    sourceType: 'module', // Permite el uso de import/export
  },
  plugins: [
    'react', // Plugin para reglas específicas de React
    'react-hooks', // Plugin para reglas específicas de React Hooks
    'jsx-a11y', // Plugin para reglas de accesibilidad en JSX
  ],
  rules: {
    'no-unused-vars': 'warn', // Advierte sobre variables no utilizadas
    'react-hooks/rules-of-hooks': 'error', // Aplica las reglas de los Hooks de React
    'react-hooks/exhaustive-deps': 'warn', // Verifica las dependencias de los efectos
    'react/prop-types': 'off', // Desactiva la regla de validación de prop-types
  },
  settings: {
    react: {
      version: 'detect', // Detecta automáticamente la versión de React
    },
  },
};