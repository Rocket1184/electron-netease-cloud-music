module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    plugins: [
        'html'
    ],
    'rules': {
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'no-const-assign': 1,
        'no-this-before-super': 1,
        'no-undef': 1,
        'no-unreachable': 1,
        'no-unused-vars': 1,
        'constructor-super': 1,
        'valid-typeof': 1,
        'quotes': [
            1,
            'single'
        ],
        'semi': 2
    }
}
