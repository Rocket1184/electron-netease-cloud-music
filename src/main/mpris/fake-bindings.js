/* eslint-disable */

const path = require('path');

module.exports = function bindings() {
    let d = __dirname;
    if (d.includes('app.asar')) {
        d = d.replace('app.asar', '');
    }
    return __non_webpack_require__(path.join(d, 'build/bindings.node'));
}
