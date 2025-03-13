import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import stylisticJs from '@stylistic/eslint-plugin-js';

import globals from 'globals';
import babelParser from '@babel/eslint-parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
            'build/',
            'dist/',
            'script/'
        ]
    },
    js.configs.recommended,
    {
        // js options
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            'no-console': 'error',
            '@stylistic/js/semi': ['error', 'always'],
            '@stylistic/js/quotes': ['error', 'single', { 'avoidEscape': true }],
            '@stylistic/js/indent': ['warn', 4, { 'SwitchCase': 1 }],
            '@stylistic/js/eol-last': ['error', 'always']
        }
    },
    {
        files: [
            'src/main/**/*.js'
        ],
        languageOptions: {
            globals: globals.node,
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    babelrc: false,
                    plugins: [
                        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]
                    ]
                }
            }
        },
    },
    {
        files: [
            'src/renderer/**/*.js'
        ],
        languageOptions: {
            globals: {
                'process': 'readonly',
                ...globals.browser
            }
        }
    },
    ...vue.configs['flat/vue2-essential'],
    {
        // vue sfc options
        files: ['src/renderer/**/*.vue'],
        languageOptions: {
            parser: vue.parser,
            parserOptions: {
                sourceType: 'module'
            },
            globals: globals.browser
        },
        rules: {
            'vue/multi-word-component-names': 'off', // TODO turn on this
            'vue/html-indent': ['warn', 4, {
                'alignAttributesVertically': false
            }],
            'vue/html-self-closing': ['warn', {
                'html': {
                    'void': 'never',
                    'normal': 'never',
                    'component': 'any' // TODO turn on this
                },
                'svg': 'never',
                'math': 'never'
            }],
        }
    }
];
