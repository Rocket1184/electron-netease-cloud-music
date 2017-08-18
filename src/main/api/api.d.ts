import * as Models from '../../renderer/util/models';

export interface BaseApiResopnse {
    code: number;
}

export interface LoginResponse extends BaseApiResopnse {
    loginType: number
    account: any
    profile: any
    bidings: Array<any>
}

export interface UserPlaylistResponse extends BaseApiResopnse {
    more: Boolean
    playlist: Array<Models.PlayListModel>
}

export interface MusicRecordDataItem {
    playCount: number
    score: number
    song: {
        id: number
        name: string
        al: {
            id: number
            name: string
            pic: number
            picUrl: string
            pic_str: string
        },
        ar: {
            id: number
            name: string
        }
    }
}

export interface MusicRecordResponse extends BaseApiResopnse {
    allData: Array<MusicRecordDataItem>
    weekData: Array<MusicRecordDataItem>
}

export interface DailySuggestionsMusic extends Models.TrackModel {
    alg: string
    reason: string
}

export interface DailySuggestionsRespopnse extends BaseApiResopnse {
    recommend: Array<DailySuggestionsMusic>
}

export interface ListDetailResponse extends BaseApiResopnse {
    playlist: Models.PlayListModel
    privileges: Array<any>
}

export interface MusicUrlResponse extends BaseApiResopnse {
    data: Array<{
        br: number
        canExtend: Boolean
        code: number
        expi: number
        fee: number
        flag: number
        gain: number
        id: number
        md5: string
        payed: number
        size: number
        type: string
        uf: any
        url: string
    }>
}

export interface MusicUrlCachedResponse {
    url?: string
    errno?: number | 200 | 404
}

export interface UserInfoInComment {
    authStatus: number
    avatarUrl: string
    expertTags: Array<string>
    locationInfo: any
    nickname: string
    remarkName: string
    userId: number
    userType: number
    vipType: number
}

export interface BeRepliedComment {
    content: string
    status: number
    user: UserInfoInComment
}

export interface MusicCommentItem {
    beReplied: Array<BeRepliedComment>
    commentId: number
    content: string
    liked: Boolean
    likedCount: number
    time: number
    user: UserInfoInComment
}

export interface MusicCommentsResponse extends BaseApiResopnse {
    comments: Array<MusicCommentItem>
    hotComments: Array<MusicCommentItem>
    isMusician: Boolean
    more: Boolean
    moreHot: Boolean
    topComments: Array<MusicCommentItem>
    total: number
    userId: number
}

export interface LyricObjectItem {
    // not so clear about that
    info?: {
        al?: string
        ar?: string
    }
    lyrics?: Array<{
        content: string
        timestamp: number
        trans?: string
    }>
}

export interface LyricAuthor {
    demand: number
    id: number
    nickname: string
    status: number
    uptime: number
    userid: number
}

export interface MusicLyricResponse {
    lrc?: LyricObjectItem
    lyricUser?: LyricAuthor
    mlrc?: LyricObjectItem
    transUser: LyricAuthor
}

export interface ApplicationSettings {
    bitRate: 'h' | 'm' | 'l'
    windowBorder: Boolean
    autoPlay: Boolean
}

export interface DailyTaskResponse {
    code: 200 | -2 | number
    point?: number
    msg?: string
}

export interface RawAlbum {
    id: number,
    name: string,
    artist: Models.RawArtistModel,
    copyrightId: number,
    picId: number,
    publishTime: number,
    size: number,
    status: number
}

export interface RawMV {
    artistId: number,
    artistName: string,
    artists: Array<Models.RawArtistModel>,
    briefDesc: string,
    cover: string,
    desc: any,
    duration: number,
    mark: number,
    name: string,
    playCount: number,
    subed: Boolean
}

export interface SearchResponse extends BaseApiResopnse {
    result: {
        songs?: Array<Models.TrackModel>,
        artists?: Array<Models.RawArtistModel>,
        playlists?: Array<Models.PlayListModel>,
        albums?: Array<RawAlbum>,
        mvs?: Array<RawMV>,
        order: Array<'songs' | 'artists' | 'playlists' | 'albums' | 'mvs'>
    }
}

export class ApiFunctions {
    updateCookie(cookie: string): string | any;
    getCookie(key?: string): string | any;
    login(acc: string | number, pwd: string): Promise<LoginResponse>;
    refreshLogin(): Promise<BaseApiResopnse>;
    getUserPlaylist(uid: number): Promise<UserPlaylistResponse>;
    getMusicRecord(uid: number): Promise<MusicRecordResponse>;
    getDailySuggestions(): Promise<DailySuggestionsRespopnse>;
    getListDetail(id: number): Promise<ListDetailResponse>;
    getMusicUrl(idOrIds: number | Array<number>, quality?: 'h' | 'm' | 'l'): Promise<MusicUrlResponse>;
    getMusicUrlCached(id: number, quality?: 'h' | 'm' | 'l'): Promise<MusicUrlCachedResponse>;
    getMusicComments(rid: number, limit?: number, offset?: number): Promise<MusicCommentsResponse>;
    getMusicLyric(id: number): Promise<MusicLyricResponse>;
    getMusicLyricCached(id: number): Promise<LyricObjectItem>;
    submitWebLog(action: string, json: any): Promise<BaseApiResopnse>;
    submitListened(id: number, time: number): Promise<BaseApiResopnse>;
    checkUrlStatus(url: string): Promise<number>;
    getDataSize(type: string): number | any;
    clearCache(type: string): Boolean | any;
    getVersionName(): string | any;
    getCurrentSettings(): ApplicationSettings | any;
    writeSettings(target: ApplicationSettings): ApplicationSettings | any;
    resetSettings(): ApplicationSettings | any;
    postDailyTask(type: 0 | 1): Promise<DailyTaskResponse>;
    manipulatePlaylistTracks(op: 'add' | 'del', pid: number, tracks: Array<number>);
    collectTrack(pid: number, ...tracks: Array<number>);
    uncollectTrack(pid: number, ...tracks: Array<number>);
    getSearchSuggest(s: string): Promise<SearchResponse>;
    search(s: string, type: number | string, limit?: number, offset?: number): Promise<SearchResponse>;
};

declare const ApiStatic: ApiFunctions;

export default { ...ApiStatic };
