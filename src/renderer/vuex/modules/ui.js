import * as types from '../mutation-types';
import { Artist, Album, Video, PlayList } from '@/util/models';

const state = {
    audioSrc: '',
    paused: true,
    lyric: {},
    lyricSeq: 0,
    collectPopupShow: false,
    collectTrackIds: [],
    fav: {
        album: null,
        artist: null,
        video: null
    },
    temp: {
        album: null,
        artist: null,
        playlist: null,
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
        let al = payload.album || payload;
        al.songs = payload.songs;
        state.fav.album = new Album(al);
    },
    [types.SET_UI_FAV_ARTIST](state, payload) {
        state.fav.artist = new Artist(payload);
    },
    [types.SET_UI_FAV_VIDEO](state, payload) {
        state.fav.video = new Video(payload);
    },
    [types.SET_UI_TEMP_PLAYLIST](state, payload) {
        state.temp.playlist = new PlayList(payload);
    }
};

export default {
    state,
    mutations
};
