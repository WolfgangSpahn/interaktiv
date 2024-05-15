// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.js', // Your entry point file in the src directory
  output: {
    file: 'docs/index.js', // The bundled file in the dist directory
    format: 'iife', // Immediately-invoked function expression for browser usage
    name: 'bundle'
  },
  plugins: [
    resolve(), // Allows Rollup to find node modules
    commonjs() // Converts CommonJS modules to ES6
  ]
};