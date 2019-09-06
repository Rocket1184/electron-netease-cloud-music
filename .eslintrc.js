module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    globals: {
        BigInt: 'readonly'
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
        'no-case-declarations': 'off',
        'require-atomic-updates': 'off'
    }
};
