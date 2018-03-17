module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    plugins: [
        'vue'
    ],
    extends: [
        'eslint:recommended',
        'plugin:vue/essential'
    ],
    rules: {
        'no-case-declarations': 'off'
    }
};
