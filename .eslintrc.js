module.exports = {
    root: true,
    ignorePatterns: [
        'dist/',
        'build/'
    ],
    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module'
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
        'plugin:vue/essential'
    ],
    rules: {
        'semi': 'error',
        'no-console': 'error',
        'no-case-declarations': 'off',
        'require-atomic-updates': 'off'
    }
};
