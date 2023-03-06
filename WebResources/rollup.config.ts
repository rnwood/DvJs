import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'out/ts/dvjs.js',
  output: {
    file: 'out/dvjs.js',
    format: 'iife',
    generatedCode: "es2015",
    name: "DvJs",
    sourcemap: "inline"
  },
  sourcemap: true,
  plugins: [
    resolve({
        jsnext: true,
        main: true,
        browser: true
      }
    ),
    commonJS({
      include: 'node_modules/**',
      sourceMap: false
    }),
    globals(),
    builtins(),
    sourcemaps()
  ]
};