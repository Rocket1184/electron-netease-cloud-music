'use strict';

const { ipcRenderer } = require('electron');
const { EventEmitter } = require('events');
const { versions, platform } = process;

process.once('loaded', () => {
    globalThis.process = { versions, platform };

    globalThis.require = function (id) {
        switch (id) {
            case 'electron':
                return { ipcRenderer };
            case 'events':
                return { EventEmitter };
        }
    };
});

const arg = '--initial-settings=';
let settings = {};
try {
    settings = JSON.parse(process.argv.find(v => v.startsWith(arg)).slice(arg.length));
} finally {
    Object.defineProperty(globalThis, '__initial_settings', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: settings
    });
}
