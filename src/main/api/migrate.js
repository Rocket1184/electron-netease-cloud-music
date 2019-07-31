import fs from 'fs';
import path from 'path';
import { app } from 'electron';

import { removeRecursive } from './index';

function clearLegacyLyricCache() {
    const lyricPath = path.join(app.getPath('userData'), 'lyric');
    fs.access(lyricPath, (err) => {
        if (!err) {
            removeRecursive(lyricPath);
        }
    });
}

export default function migrate() {
    clearLegacyLyricCache();
}
