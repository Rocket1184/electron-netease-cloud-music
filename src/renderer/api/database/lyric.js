import { lyricTable } from './db';

export function save(id, lyric) {
    if (lyric.lrc || lyric.mlrc || lyric.txtLyric) {
        lyric.id = id;
        return lyricTable.put(lyric);
    }
}

export function get(id) {
    return lyricTable
        .where('id')
        .equals(id)
        .first();
}
