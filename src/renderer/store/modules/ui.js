import * as types from '../mutation-types';
import { Artist, Album, Video, PlayList, Track } from '@/util/models';

const state = {
    audioSrc: '',
    audioVolume: 100,
    audioMute: false,
    paused: true,
    lyricLoading: false,
    /** @type {Partial<Types.MusicLyricRes>} */
    lyric: {},
    search: {
        pending: false,
        keyword: '',
        type: '',
        offset: 0,
        result: {
            total: 0,
            /** @type {?(Models.Album|Models.Artist|Models.PlayList|Models.Track|Models.User|Models.Video)[]} */
            items: null
        },
        /** @type {?{code: number, msg?: string}} */
        error: null
    },
    collectPopupShow: false,
    /** @type {number[]} */
    collectTrackIds: [],
    fav: {
        /** @type {Models.Album} */
        album: null,
        artist: {
            /** @type {Models.Artist} */
            detail: null,
            /** @type {Models.Track[]} */
            hotSongs: []
        },
        /** @type {Models.Video} */
        video: null
    },
    temp: {
        /** @type {Models.Album} */
        album: null,
        /** @type {Types.RelatedAlbum[]} */
        relatedAlbums: null,
        artist: {
            /** @type {Models.Artist} */
            detail: null,
            /** @type {Models.Track[]} */
            hotSongs: []
        },
        /** @type {Models.PlayList} */
        playlist: null,
        /** @type {Types.RelatedPlaylist[]} */
        relatedPlaylists: null,
        /** @type {Models.Video} */
        video: null
    },
    radioMode: false
};

/**
 * @param {(typeof state.fav) | (typeof state.temp)} section 
 * @param {Types.ArtistDetailWRes} payload 
 */
function setStateArtist(section, payload) {
    const ar = { detail: null, hotSongs: [] };
    if (!payload) {
        section.artist = ar;
        return;
    }
    if (payload.artist) {
        ar.detail = new Artist(payload.artist);
    }
    if (payload.hotSongs) {
        ar.hotSongs = payload.hotSongs.map(s => new Track(s));
    }
    section.artist = ar;
}

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.RESTORE_UI_STATE](state, payload) {
        Object.entries(payload).forEach(([key, val]) => state[key] = val);
    },
    [types.SET_AUDIO_PAUSED](state, /** @type {boolean} */ payload) {
        state.paused = payload;
    },
    [types.UPDATE_PLAYING_URL](state, /** @type {string} */ payload) {
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
    [types.SET_ACTIVE_LYRIC](state, /** @type {Types.MusicLyricRes} */ payload) {
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
    [types.SET_COLLECT_TRACKS](state, /** @type {{ ids: number[] }} */ payload) {
        state.collectTrackIds = payload.ids;
    },
    [types.SET_UI_FAV_ALBUM](state, /** @type {Types.AlbumDetailRes} */ payload) {
        if (!payload) return state.fav.album = null;
        let al = payload.album || payload;
        al.songs = payload.songs;
        state.fav.album = new Album(al);
    },
    [types.SET_UI_FAV_ARTIST](state, /** @type {Types.ArtistDetailWRes} */ payload) {
        setStateArtist(state.fav, payload);
    },
    [types.SET_UI_FAV_VIDEO](state, /** @type {Types.VideoDetailData | Types.MVDetailData} */ payload) {
        if (!payload) return state.fav.video = null;
        state.fav.video = new Video(payload);
    },
    [types.SET_UI_TEMP_PLAYLIST](state, /** @type {Types.PlaylistDetail} */ payload) {
        if (!payload) return state.fav.playlist = null;
        state.temp.playlist = new PlayList(payload);
    },
    [types.SET_UI_TEMP_RELATED_PLAYLISTS](state, /** @type {Types.RelatedPlaylist[]} */ payload) {
        state.temp.relatedPlaylists = payload;
    },
    [types.SET_UI_TEMP_ALBUM](state, /** @type {Types.AlbumDetailWRes} */ payload) {
        let al = payload.album || payload;
        al.songs = payload.songs;
        state.temp.album = new Album(al);
    },
    [types.SET_UI_TEMP_RELATED_ALBUMS](state, /** @type {Types.RelatedAlbum[]} */ payload) {
        state.temp.relatedAlbums = payload;
    },
    [types.SET_UI_TEMP_ARTIST](state, /** @type {Types.ArtistDetailWRes} */ payload) {
        setStateArtist(state.temp, payload);
    },
    [types.SET_UI_TEMP_VIDEO](state, /** @type {Types.VideoDetailData | Types.MVDetailData} */ payload) {
        state.temp.video = new Video(payload);
    },
    [types.ACTIVATE_RADIO](state, /** @type {boolean} */ payload) {
        state.radioMode = payload;
    }
};

export default {
    state,
    mutations
};
