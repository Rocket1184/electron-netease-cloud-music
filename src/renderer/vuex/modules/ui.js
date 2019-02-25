import * as types from '../mutation-types';
import { Artist, Album, Video, PlayList, Track } from '@/util/models';

const state = {
    audioSrc: '',
    audioVolume: 100,
    audioMute: false,
    paused: true,
    lyricLoading: false,
    lyric: {},
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
    collectPopupShow: false,
    collectTrackIds: [],
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
    },
    radioMode: false
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
    [types.RESTORE_UI_STATE](state, payload) {
        Object.entries(payload).forEach(([key, val]) => state[key] = val);        
    },
    [types.PAUSE_PLAYING_MUSIC](state) {
        state.paused = true;
    },
    [types.RESUME_PLAYING_MUSIC](state) {
        state.paused = false;
    },
    [types.UPDATE_PLAYING_URL](state, payload) {
        state.audioSrc = payload;
    },
    [types.SET_AUDIO_VOLUME](state, { mute, volume }) {
        if (typeof mute === 'boolean') state.audioMute = mute;
        if (typeof volume === 'number') state.audioVolume = volume;
    },
    [types.SET_LYRIC_LOADING](state, payload) {
        if (payload === true) {
            state.lyricLoading = true;
        } else {
            state.lyricLoading = false;
        }
    },
    [types.SET_ACTIVE_LYRIC](state, payload) {
        state.lyric = payload;
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
    [types.ACTIVATE_RADIO](state, payload) {
        state.radioMode = payload;
    }
};

export default {
    state,
    mutations
};
