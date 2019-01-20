import * as types from '../mutation-types';
import { Artist, Album, Video, PlayList, Track } from '@/util/models';

const state = {
    audioSrc: '',
    paused: true,
    lyric: {},
    lyricSeq: 0,
    search: {
        pending: false,
        keyword: '',
        type: '',
        offset: 0,
        result: {
            total: 0,
            items: null
        },
        error: null
    },
    loginPending: false,
    collectPopupShow: false,
    collectTrackIds: [],
    recommendSongs: [],
    recommendStatistics: {
        playCnt: '...',
        likeCnt: '...',
        followCnt: '...'
    },
    fav: {
        album: null,
        artist: {
            detail: null,
            hotSongs: []
        },
        video: null
    },
    temp: {
        album: null,
        relatedAlbums: null,
        artist: {
            detail: null,
            hotSongs: []
        },
        playlist: null,
        relatedPlaylists: null,
        video: null
    }
};

function setStateArtist(section, payload) {
    if (!payload) return section.artist = {
        detail: null,
        hotSongs: []
    };
    if (payload.artist) {
        section.artist = { detail: new Artist(payload.artist) };
    }
    if (payload.hotSongs) {
        section.artist.hotSongs = payload.hotSongs.map(s => new Track(s));
    }
}

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
    [types.SET_SEARCH_PARAM](state, { keyword, type, offset }) {
        state.search.keyword = keyword;
        state.search.type = type;
        state.search.offset = offset;
    },
    [types.SET_SEARCH_PENDING](state, payload) {
        state.search.pending = payload;
    },
    [types.SET_SEARCH_RESULT](state, payload) {
        state.search.error = null;
        state.search.result = payload;
    },
    [types.SET_SEARCH_ERROR](state, payload) {
        state.search.error = payload;
        state.search.result = { total: 0, items: null };
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
        setStateArtist(state.fav, payload);
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
    [types.SET_UI_TEMP_ARTIST](state, payload) {
        setStateArtist(state.temp, payload);
    },
    [types.SET_UI_TEMP_VIDEO](state, payload) {
        state.temp.video = new Video(payload);
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
