const fs = require('fs');
const path = require('path');

const ProjectRoot = path.join(__dirname, '..');

function absPath(...paths) {
    return path.join(ProjectRoot, ...paths);
}

function removeKeepDot(dir) {
    const toRemove = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    if (!toRemove.length) return false;
    toRemove.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && !file.startsWith('.')) {
            fs.unlinkSync(fullPath);
        } else if (stat.isDirectory) {
            removeKeepDot(fullPath);
        }
    });
    return true;
}

module.exports = {
    absPath,
    removeKeepDot
};
