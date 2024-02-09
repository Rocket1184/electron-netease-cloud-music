const pkgJson = require('../package.json');

module.exports = {
    name: pkgJson.name,
    version: pkgJson.version,
    productName: 'Electron-NCM',
    devPort: 24353
};
