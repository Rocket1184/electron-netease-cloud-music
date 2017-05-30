const searchIconMap = {
    songs: 'music_note',
    playlists: 'featured_play_list',
    albums: 'album',
    users: 'person',
    artists: 'account_circle',
    mvs: 'music_video'
};

const searchTypeMap = {
    song: '1',
    album: '10',
    artist: '100',
    playlist: '1000',
    user: '1002',
    mv: '1004',
    lyric: '1006',
    radio: '1009'
};

const types = {
    song: 'song',
    album: 'album',
    artist: 'artist',
    playlist: 'playlist',
    user: 'user',
    mv: 'mv',
    lyric: 'lyric',
    radio: 'radio'
};

export {
    types,
    searchIconMap,
    searchTypeMap
};
