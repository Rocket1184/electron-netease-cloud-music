import * as types from '../mutation-types';
import { User, PlayList, Artist, Album, Video, DjRadio } from '@/util/models';

const state = {
    loginValid: false,
    loginPending: false,
    signPending: false,
    signStatus: {
        timestamp: -1,
        pcSign: false,
        mobileSign: false
    },
    /** @type {number[]} */
    favTrackIds: [],
    /** @type {Models.PlayList[]} */
    playlist: [],
    /** @type {Models.User} */
    info: new User({}),
    /** @type {Models.Artist[]} */
    artists: [],
    /** @type {Models.Video[]} */
    videos: [],
    /** @type {Models.Album[]} */
    albums: [],
    /** @type {Models.DjRadio[]} */
    djradios: []
};

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
    [types.SET_LOGIN_VALID](state, payload) {
        state.loginValid = payload;
    },
    [types.SET_LOGIN_PENDING](state, payload) {
        state.loginPending = payload;
    },
    [types.SET_USER_INFO](state, payload) {
        state.info = new User(payload);
    },
    [types.SET_USER_SIGN_PENDING](state, payload) {
        state.signPending = payload;
    },
    [types.SET_USER_SIGN_STATUS](state, payload) {
        if (!payload) {
            state.signStatus = {
                timestamp: -1,
                pcSign: false,
                mobileSign: false
            };
            return;
        }
        Object.assign(state.signStatus, payload);
    },
    [types.SET_USER_FAVOR_TRACKS](state, /** @type {number[]} */ payload) {
        state.favTrackIds = payload;
    },
    [types.SET_USER_PLAYLISTS](state, /** @type {Types.PlaylistDetail[]} */ payload) {
        state.playlist = payload.map(l => new PlayList(l));
    },
    [types.UPDATE_USER_PLAYLIST](state, /** @type {Models.PlayList} */ payload) {
        const i = state.playlist.findIndex(p => p.id === payload.id);
        if (i >= 0) {
            state.playlist.splice(i, 1, payload);
        }
    },
    [types.SUBSCRIBE_PLAYLIST](state, /** @type {Types.PlaylistDetail} */ payload) {
        const start = state.playlist.findIndex(p => p.creator.id !== state.info.id);
        state.playlist.splice(start, 0, new PlayList(payload));
    },
    [types.UNSUBSCRIBE_PLAYLIST](state, /** @type {{id:number}} */ { id }) {
        const index = state.playlist.findIndex(l => l.id === id);
        if (index !== -1) {
            state.playlist.splice(index, 1);
        }
    },
    [types.SET_USER_ALBUMS](state, /** @type {Types.AlbumDetail[]} */ payload) {
        state.albums = payload.map(al => new Album(al));
    },
    [types.SUBSCRIBE_ALBUM](state, /** @type {Types.AlbumDetail} */ payload) {
        state.albums.splice(0, 0, new Album(payload));
    },
    [types.UNSUBSCRIBE_ALBUM](state, /** @type {{id:number}} */ { id }) {
        const index = state.albums.findIndex(a => a.id === id);
        if (index !== -1) {
            state.albums.splice(index, 1);
        }
    },
    [types.SET_USER_ARTISTS](state, /** @type {Types.SearchArtist[]} */ payload) {
        state.artists = payload.map(al => new Artist(al));
    },
    [types.SUBSCRIBE_ARTIST](state, /** @type {Types.ArtistDetailEArtist} */ payload) {
        state.artists.splice(0, 0, new Artist(payload));
    },
    [types.UNSUBSCRIBE_ARTIST](state, /** @type {{id:number}} */ { id }) {
        const index = state.artists.findIndex(a => a.id === id);
        if (index !== -1) {
            state.artists.splice(index, 1);
        }
    },
    [types.SET_USER_VIDEOS](state, /** @type {Types.SearchVideo[]} */ payload) {
        state.videos = payload.map(al => new Video(al));
    },
    [types.SUBSCRIBE_VIDEO](state, /** @type {Types.VideoDetailData} */ payload) {
        const v = payload instanceof Video ? payload : new Video(payload);
        state.videos.splice(0, 0, v);
    },
    [types.UNSUBSCRIBE_VIDEO](state, /** @type {{id:string}} */ { id }) {
        const index = state.videos.findIndex(v => v.id === id);
        if (index !== -1) {
            state.videos.splice(index, 1);
        }
    },
    [types.SET_USER_DJ_RADIOS](state, /** @type {Types.DjDetailData[]} */ payload) {
        state.djradios = payload.map(r => new DjRadio(r));
    },
    [types.SUBSCRIBE_DJ_RADIO](state, /** @type {Models.DjRadio} */ payload) {
        state.djradios.splice(0, 0, payload);
    },
    [types.UNSUBSCRIBE_DJ_RADIO](state, /** @type {{id:number}} */ { id }) {
        const index = state.djradios.findIndex(v => v.id === id);
        if (index !== -1) {
            state.djradios.splice(index, 1);
        }
    }
};

export default {
    state,
    mutations
};
