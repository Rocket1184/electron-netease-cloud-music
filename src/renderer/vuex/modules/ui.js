import * as types from '../mutation-types';
import { Artist, Album, Video, PlayList, Track } from '@/util/models';

const state = {
    audioSrc: '',
    paused: true,
    lyric: {},
    lyricSeq: 0,
    loginPending: false,
    collectPopupShow: false,
    collectTrackIds: [],
    recommendSongs: [],
    recommendStatistics: {},
    fav: {
        album: null,
        artist: {
            detail: null,
            hotSongs: [],
            albums: [],
            mvs: [],
            intro: null
        },
        video: null
    },
    temp: {
        album: null,
        relatedAlbums: null,
        artist: null,
        playlist: null,
        relatedPlaylists: null,
        video: null
    }
};

const mutations = {
    [types.PAUSE_PLAYING_MUSIC](state) {
        state.paused = true;
    },
    [types.RESUME_PLAYING_MUSIC](state) {
        state.paused = false;
    },
    [types.UPDATE_PLAYING_URL](state, payload) {
        state.audioSrc = payload;
    },
    [types.SET_ACTIVE_LYRIC](state, payload) {
        state.lyric = payload;
        state.lyricSeq = state.lyricSeq + 1;
    },
    [types.SET_LOGIN_PENDING](state, payload) {
        if (payload === true) {
            state.loginPending = true;
        } else {
            state.loginPending = false;
        }
    },
    [types.SHOW_COLLECT_POPUP](state) {
        state.collectPopupShow = true;
    },
    [types.HIDE_COLLECT_POPUP](state) {
        state.collectPopupShow = false;
    },
    [types.SET_COLLECT_TRACKS](state, payload) {
        state.collectTrackIds = payload.ids;
    },
    [types.SET_UI_FAV_ALBUM](state, payload) {
        if (!payload) return state.fav.album = null;
        let al = payload.album || payload;
        al.songs = payload.songs;
        state.fav.album = new Album(al);
    },
    [types.SET_UI_FAV_ARTIST](state, payload) {
        if (!payload) return state.fav.artist = {
            detail: null,
            hotSongs: [],
            albums: [],
            mvs: [],
            intro: null
        };
        if (payload.artist) {
            state.fav.artist = { detail: new Artist(payload.artist) };
        }
        if (payload.hotSongs) {
            state.fav.artist.hotSongs = payload.hotSongs.map(s => new Track(s));
        }
        if (payload.albums) {
            state.fav.artist.albums = payload.albums.map(al => new Album(al));
        }
        if (payload.mvs) {
            state.fav.artist.mvs = payload.mvs.map(v => new Video(v));
        }
        if (payload.intro) {
            state.fav.artist.intro = payload.intro;
        }
    },
    [types.SET_UI_FAV_VIDEO](state, payload) {
        if (!payload) return state.fav.video = null;
        state.fav.video = new Video(payload);
    },
    [types.SET_UI_TEMP_PLAYLIST](state, payload) {
        if (!payload) return state.fav.playlist = null;
        state.temp.playlist = new PlayList(payload);
    },
    [types.SET_UI_TEMP_RELATED_PLAYLISTS](state, payload) {
        state.temp.relatedPlaylists = payload;
    },
    [types.SET_UI_TEMP_ALBUM](state, payload) {
        let al = payload.album || payload;
        al.songs = payload.songs;
        state.temp.album = new Album(al);
    },
    [types.SET_UI_TEMP_RELATED_ALBUMS](state, payload) {
        state.temp.relatedAlbums = payload;
    },
    [types.SET_UI_RECOMMEND_SONGS](state, payload) {
        state.recommendSongs = payload.map(t => new Track(t));
    },
    [types.SET_UI_RECOMMEND_STATISTICS](state, payload) {
        state.recommendStatistics = payload;
    }
};

export default {
    state,
    mutations
};
