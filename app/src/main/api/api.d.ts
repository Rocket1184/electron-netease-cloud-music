import * as Models from '../../renderer/util/models';

export interface BaseApiResopnse {
    code: Number;
}

export interface LoginResponse extends BaseApiResopnse {
    loginType: Number
    account: any
    profile: any
    bidings: Array<any>
}

export interface UserPlaylistResponse extends BaseApiResopnse {
    more: Boolean
    playlist: Array<Models.PlayListModel>
}

export interface MusicRecordDataItem {
    playCount: Number
    score: Number
    song: {
        id: Number
        name: String
        al: {
            id: Number
            name: String
            pic: Number
            picUrl: String
            pic_str: String
        },
        ar: {
            id: Number
            name: String
        }
    }
}

export interface MusicRecordResponse extends BaseApiResopnse {
    allData: Array<MusicRecordDataItem>
    weekData: Array<MusicRecordDataItem>
}

export interface DailySuggestionsMusic extends Models.TrackModel {
    alg: String
    reason: String
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
        br: Number
        canExtend: Boolean
        code: Number
        expi: Number
        fee: Number
        flag: Number
        gain: Number
        id: Number
        md5: String
        payed: Number
        size: Number
        type: String
        uf: any
        url: String
    }>
}

export interface UserInfoInComment {
    authStatus: Number
    avatarUrl: String
    expertTags: Array<String>
    locationInfo: any
    nickname: String
    remarkName: String
    userId: Number
    userType: Number
    vipType: Number
}

export interface BeRepliedComment {
    content: String
    status: Number
    user: UserInfoInComment
}

export interface MusicCommentItem {
    beReplied: Array<BeRepliedComment>
    commentId: Number
    content: String
    liked: Boolean
    likedCount: Number
    time: Number
    user: UserInfoInComment
}

export interface MusicCommentsResponse extends BaseApiResopnse {
    comments: Array<MusicCommentItem>
    hotComments: Array<MusicCommentItem>
    isMusician: Boolean
    more: Boolean
    moreHot: Boolean
    topComments: Array<MusicCommentItem>
    total: Number
    userId: Number
}

export interface LyricObjectItem {
    // not so clear about that
    info?: {
        al?: String
        ar?: String
    }
    lyrics?: Array<{
        content: String
        timestamp: Number
        trans?: String
    }>
}

export interface LyricAuthor {
    demand: Number
    id: Number
    nickname: String
    status: Number
    uptime: Number
    userid: Number
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
    code: 200 | -2 | Number
    point?: Number
    msg?: String
}

export default class API {
    updateCookie(cookie: String): String | any;

    getCookie(key?: String): String | any;

    login(acc: String | Number, pwd: String): Promise<LoginResponse>;

    refreshLogin(): Promise<BaseApiResopnse>;

    getUserPlaylist(uid: Number): Promise<UserPlaylistResponse>;

    getMusicRecord(uid: Number): Promise<MusicRecordResponse>;

    getDailySuggestions(): Promise<DailySuggestionsRespopnse>;

    getListDetail(id: Number): Promise<ListDetailResponse>;

    getMusicUrl(idOrIds: Number | Array<Number>, quality?: 'h' | 'm' | 'l'): Promise<MusicUrlResponse>;

    getMusicComments(rid: Number, limit?: Number, offset?: Number): Promise<MusicCommentsResponse>;

    getMusicLyric(id: Number): Promise<MusicLyricResponse>;

    submitWebLog(action: String, json: any): Promise<BaseApiResopnse>;

    submitListened(id: Number, time: Number): Promise<BaseApiResopnse>;

    checkUrlStatus(url: String): Promise<Number>;

    getDirSize(dirPath: String): Number | any;

    getDataSize(name: 'app' | 'cache'): Number | any;

    clearAppData(name: 'app' | 'cache'): void;

    getVersionName(): String | any;

    getCurrentSettings(): ApplicationSettings | any;

    writeSettings(target: ApplicationSettings): void;

    postDailyTask(type: 0 | 1): Promise<DailyTaskResponse>;
}
