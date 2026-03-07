import baseConfig from '@template/eslint-config';

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname || process.cwd(),
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
