// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

const features = fs
  .readdirSync(path.join(__dirname, 'src/app/features'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

/** @typedef {{ group: string[]; message: string }} ImportPattern */

/** @type {ImportPattern} */
const deepRelativeImports = {
  group: ['../../*'],
  message: 'Use an alias (@core, @features, @layouts, @shared, @environments) instead of ../../',
};

/**
 * @param {...ImportPattern} patterns
 * @returns {import('eslint').Linter.RulesRecord}
 */
const restrictImports = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns: [deepRelativeImports, ...patterns] }],
});

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      ...restrictImports(),
    },
  },

  {
    files: ['src/app/shared/**/*.ts'],
    rules: restrictImports({
      group: ['@features/*', '@layouts/*'],
      message: 'Shared must stay generic and must not depend on features/layouts.',
    }),
  },
  {
    files: ['src/app/core/**/*.ts'],
    rules: restrictImports({
      group: ['@features/*', '@layouts/*'],
      message: 'Core must not depend on features/layouts.',
    }),
  },
  {
    files: ['src/app/core/services/auth-service.ts'],
    rules: restrictImports({
      group: ['@features/*', '!@features/auth', '@features/auth/*', '!@features/auth/models', '@layouts/*'],
      message: 'Core must not depend on features/layouts.',
    }),
  },
  ...features.map((feature) => ({
    files: [`src/app/features/${feature}/**/*.ts`],
    rules: restrictImports(
      {
        group: ['@features/*/**', `!@features/${feature}/**`],
        message: 'Import other features only through their index.ts (e.g. @features/reservations).',
      },
      {
        group: ['@layouts/*'],
        message: 'Features must not depend on layouts.',
      },
    ),
  })),

  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
