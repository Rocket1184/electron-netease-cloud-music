module.exports = {
    root: true,
    ignorePatterns: [
        '**/*.d.ts',
        'dist/',
        'build/'
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
            plugins: [
                '@babel/plugin-proposal-class-properties',
                ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]
            ]
        }
    },
    env: {
        browser: true,
        node: true,
        es2020: true
    },
    plugins: [
        'vue'
    ],
    extends: [
        'eslint:recommended',
        'plugin:vue/base',
        'plugin:vue/essential'
    ],
    rules: {
        'semi': 'error',
        'no-console': 'error',
        'no-case-declarations': 'off',
        'require-atomic-updates': 'off',
        'vue/multi-word-component-names': 'off'
    }
};
