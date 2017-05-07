import * as Models from '../../renderer/util/models';

export interface BaseApiResopnse {
    code: Number;
};

export interface LoginResponse extends BaseApiResopnse {
    loginType: Number
    account: any
    profile: any
    bidings: Array<any>
}

declare function login(
    acc: String | Number,
    pwd: String
): Promise<LoginResponse>;

declare function refreshLogin(): Promise<BaseApiResopnse>;

export interface UserPlaylistResponse extends BaseApiResopnse {
    more: Boolean
    playlist: Array<Models.Track>
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

export interface DailySuggestionsMusic extends Models.Track {
    alg: String
    reason: String
}

export interface DailySuggestionsRespopnse extends BaseApiResopnse {
    recommend: Array<DailySuggestionsMusic>
}

declare function getDailySuggestions(): Promise<DailySuggestionsRespopnse>;

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

declare function getMusicUrl(
    idOrIds: Number | Array<Number>,
    quality?: 'h' | 'm' | 'l'
): Promise<MusicUrlResponse>;

// TODO: Response type for getMusicComments
declare function getMusicComments(
    rid: Number,
    limit?: Number,
    offset?: Number
): Promise<any>;

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

declare function getVersionName(): String;

export interface ApplicationSettings {
    bitRate: 'h' | 'm' | 'l'
    windowBorder: Boolean
    autoPlay: Boolean
}

declare function getCurrentSettings(): ApplicationSettings;

export interface DailyTaskResponse {
    code: 200 | -2 | Number
    point?: Number
    msg?: String
}

export default class API {
    getUserPlaylist(uid: Number): Promise<UserPlaylistResponse>
    getMusicRecord(uid: Number): Promise<MusicRecordResponse>
    getListDetail(id: Number): Promise<ListDetailResponse>
    getMusicLyric(id: Number): Promise<MusicLyricResponse>
    submitWebLog(action: String, json: any): Promise<BaseApiResopnse>
    submitListened(id: Number, time: Number): Promise<BaseApiResopnse>
    checkUrlStatus(url: String): Promise<Number>
    getDirSize(dirPath: String): Number
    getDataSize(name: 'app' | 'cache'): Number
    clearAppData(name: 'app' | 'cache'): void
    writeSettings(target: ApplicationSettings): void
    postDailyTask(type: 0 | 1): Promise<DailyTaskResponse>
}
