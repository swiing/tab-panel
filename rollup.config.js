import { importAssertions } from 'acorn-import-assertions';
import { importAssertionsPlugin } from 'rollup-plugin-import-assert';

export default {
  input: 'out/tab-panel.js',
  output: {
    format: 'esm',
    dir: 'dist/'
  },
  acornInjectPlugins: [importAssertions],
  plugins: [
    importAssertionsPlugin()
  ],
  // https://stackoverflow.com/a/60347490
  context: "this"
}
