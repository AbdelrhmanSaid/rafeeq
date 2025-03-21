import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig([
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
])
