import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json' };

const input = './index.ts';

const config = [
  {
    input,
    output: {
      file: 'dist/vueact.global.js',
      format: 'iife',
      name: 'Vueact',
      globals: {
        react: 'React'
      },
      sourcemap: true,
      exports: 'named'
    },
    external: ['react'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist'
      })
    ]
  },
  {
    input,
    output: {
      file: 'dist/vueact.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    external: ['react'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist'
      })
    ]
  },
  {
    input,
    output: {
      file: 'dist/vueact.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external: ['react'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist'
      })
    ]
  }
];

export default config;
